import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import re
import uuid
import logging
import bcrypt
import jwt
import requests
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Query
from fastapi.responses import Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
APP_NAME = os.environ.get("APP_NAME", "cahaya-kehidupan")

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("cahaya")

app = FastAPI(title="Cahaya Kehidupan CMS")
api_router = APIRouter(prefix="/api")
public_router = APIRouter(prefix="/api/public")


@app.get("/health")
async def health_check():
    return {"status": "ok"}

MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp",
    "gif": "image/gif", "pdf": "application/pdf", "mp4": "video/mp4", "mp3": "audio/mpeg",
}
ALLOWED_EXT = {"jpg", "jpeg", "png", "webp", "pdf", "mp4", "mp3"}

ROLES = ["SUPER_ADMIN", "EDITOR", "AUTHOR"]

# ---------------------------------------------------------------------------
# Object storage helpers
# ---------------------------------------------------------------------------
storage_key = None


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Tidak terautentikasi")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="Pengguna tidak ditemukan")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token kedaluwarsa")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")


async def get_optional_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            return None
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.InvalidTokenError:
        return None


def require_roles(*allowed):
    async def checker(user: dict = Depends(get_current_user)):
        if user["role"] not in allowed:
            raise HTTPException(status_code=403, detail="Akses ditolak untuk peran ini")
        return user
    return checker


# ---------------------------------------------------------------------------
# Utils
# ---------------------------------------------------------------------------
def slugify(text: str) -> str:
    text = (text or "").lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text or "untitled"


async def unique_slug(collection, base: str, exclude_id: Optional[str] = None) -> str:
    slug = slugify(base)
    candidate = slug
    i = 1
    while True:
        q = {"slug": candidate}
        if exclude_id:
            q["id"] = {"$ne": exclude_id}
        existing = await collection.find_one(q)
        if not existing:
            return candidate
        i += 1
        candidate = f"{slug}-{i}"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean(doc: dict) -> dict:
    doc.pop("_id", None)
    return doc


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "AUTHOR"


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None


class AuthorInput(BaseModel):
    name: str
    bio: Optional[str] = ""
    avatar: Optional[str] = ""


class CategoryInput(BaseModel):
    name: str
    description: Optional[str] = ""


class SubcategoryInput(BaseModel):
    name: str
    category_id: Optional[str] = None
    description: Optional[str] = ""


class TagInput(BaseModel):
    name: str


class CollectionInput(BaseModel):
    name: str
    description: Optional[str] = ""
    cover: Optional[str] = ""
    status: str = "PUBLISHED"


class SurahInput(BaseModel):
    name: str
    arabic_name: Optional[str] = ""
    number: int
    total_ayah: int


class PostInput(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    excerpt: Optional[str] = ""
    content: str = ""
    cover_image: Optional[str] = ""
    video_url: Optional[str] = ""
    gallery_images: List[str] = []
    type: str = "ARTICLE"  # ARTICLE | TADABBUR | CAHAYA_HIKMAH
    status: str = "DRAFT"  # DRAFT | PUBLISHED | ARCHIVED
    author_id: Optional[str] = None
    category_id: Optional[str] = None
    subcategory_id: Optional[str] = None
    tag_ids: List[str] = []
    collection_ids: List[str] = []
    published_at: Optional[str] = None
    # tadabbur
    surah_id: Optional[str] = None
    ayat_number: Optional[str] = None
    theme: Optional[str] = None
    slug: Optional[str] = None


class BookInput(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    author_id: Optional[str] = None
    cover: Optional[str] = ""
    description: Optional[str] = ""
    year: Optional[str] = ""
    content: Optional[str] = ""
    pdf_file: Optional[str] = ""
    download_enabled: bool = False
    status: str = "DRAFT"
    published_at: Optional[str] = None
    slug: Optional[str] = None


class RisalahInput(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    author_id: Optional[str] = None
    cover: Optional[str] = ""
    description: Optional[str] = ""
    content: Optional[str] = ""
    pdf_file: Optional[str] = ""
    download_enabled: bool = False
    status: str = "DRAFT"
    published_at: Optional[str] = None
    slug: Optional[str] = None


class SettingsInput(BaseModel):
    general: Optional[dict] = None
    seo: Optional[dict] = None
    homepage: Optional[dict] = None


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api_router.post("/auth/login")
async def login(data: LoginInput):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email atau kata sandi salah")
    token = create_access_token(user["id"], user["email"], user["role"])
    clean(user)
    user.pop("password_hash", None)
    return {"token": token, "user": user}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api_router.post("/auth/register")
async def register(data: RegisterInput):
    email = data.email.lower().strip()
    if not data.name.strip():
        raise HTTPException(status_code=422, detail="Nama wajib diisi")
    if len(data.password) < 6:
        raise HTTPException(status_code=422, detail="Kata sandi minimal 6 karakter")
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=422, detail="Email sudah terdaftar")
    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name.strip(),
        "email": email,
        "password_hash": hash_password(data.password),
        "role": "MEMBER",
        "avatar": "",
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.users.insert_one(doc)
    token = create_access_token(doc["id"], doc["email"], doc["role"])
    clean(doc)
    doc.pop("password_hash", None)
    return {"token": token, "user": doc}


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
@api_router.get("/dashboard/stats")
async def dashboard_stats(user: dict = Depends(get_current_user)):
    total_posts = await db.posts.count_documents({})
    tadabbur_count = await db.posts.count_documents({"type": "TADABBUR"})
    article_count = await db.posts.count_documents({"type": "ARTICLE"})
    book_count = await db.books.count_documents({})
    risalah_count = await db.risalahs.count_documents({})
    collection_count = await db.collections.count_documents({})
    user_count = await db.users.count_documents({})
    draft_count = await db.posts.count_documents({"status": "DRAFT"})
    published_count = await db.posts.count_documents({"status": "PUBLISHED"})

    recent = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(8)
    drafts = await db.posts.find({"status": "DRAFT"}, {"_id": 0}).sort("created_at", -1).to_list(6)
    recent = [await enrich_post(p) for p in recent]
    drafts = [await enrich_post(p) for p in drafts]
    return {
        "total_posts": total_posts,
        "tadabbur_count": tadabbur_count,
        "article_count": article_count,
        "book_count": book_count,
        "risalah_count": risalah_count,
        "collection_count": collection_count,
        "user_count": user_count,
        "draft_count": draft_count,
        "published_count": published_count,
        "recent_posts": recent,
        "draft_posts": drafts,
    }


# ---------------------------------------------------------------------------
# Generic taxonomy CRUD helpers
# ---------------------------------------------------------------------------
async def enrich_post(p: dict) -> dict:
    p = dict(p)
    author = await db.authors.find_one({"id": p.get("author_id")}, {"_id": 0}) if p.get("author_id") else None
    cat = await db.categories.find_one({"id": p.get("category_id")}, {"_id": 0}) if p.get("category_id") else None
    sub = await db.subcategories.find_one({"id": p.get("subcategory_id")}, {"_id": 0}) if p.get("subcategory_id") else None
    surah = await db.surahs.find_one({"id": p.get("surah_id")}, {"_id": 0}) if p.get("surah_id") else None
    p["author"] = author
    p["category"] = cat
    p["subcategory"] = sub
    p["surah"] = surah
    return p


# ---- Authors ----
@api_router.get("/authors")
async def list_authors(user: dict = Depends(get_current_user)):
    return await db.authors.find({}, {"_id": 0}).sort("name", 1).to_list(500)


@api_router.post("/authors")
async def create_author(data: AuthorInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = await unique_slug(db.authors, data.name)
    doc["created_at"] = now_iso()
    await db.authors.insert_one(doc)
    return clean(doc)


@api_router.put("/authors/{item_id}")
async def update_author(item_id: str, data: AuthorInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    upd = data.model_dump()
    await db.authors.update_one({"id": item_id}, {"$set": upd})
    doc = await db.authors.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Author tidak ditemukan")
    return doc


@api_router.delete("/authors/{item_id}")
async def delete_author(item_id: str, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.authors.delete_one({"id": item_id})
    return {"ok": True}


# ---- Categories ----
@api_router.get("/categories")
async def list_categories(user: dict = Depends(get_current_user)):
    return await db.categories.find({}, {"_id": 0}).sort("name", 1).to_list(500)


@api_router.post("/categories")
async def create_category(data: CategoryInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = await unique_slug(db.categories, data.name)
    doc["created_at"] = now_iso()
    await db.categories.insert_one(doc)
    return clean(doc)


@api_router.put("/categories/{item_id}")
async def update_category(item_id: str, data: CategoryInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.categories.update_one({"id": item_id}, {"$set": data.model_dump()})
    doc = await db.categories.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Kategori tidak ditemukan")
    return doc


@api_router.delete("/categories/{item_id}")
async def delete_category(item_id: str, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.categories.delete_one({"id": item_id})
    return {"ok": True}


# ---- Subcategories ----
@api_router.get("/subcategories")
async def list_subcategories(user: dict = Depends(get_current_user)):
    subs = await db.subcategories.find({}, {"_id": 0}).sort("name", 1).to_list(500)
    for s in subs:
        cat = await db.categories.find_one({"id": s.get("category_id")}, {"_id": 0}) if s.get("category_id") else None
        s["category"] = cat
    return subs


@api_router.post("/subcategories")
async def create_subcategory(data: SubcategoryInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = await unique_slug(db.subcategories, data.name)
    doc["created_at"] = now_iso()
    await db.subcategories.insert_one(doc)
    return clean(doc)


@api_router.put("/subcategories/{item_id}")
async def update_subcategory(item_id: str, data: SubcategoryInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.subcategories.update_one({"id": item_id}, {"$set": data.model_dump()})
    doc = await db.subcategories.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Subkategori tidak ditemukan")
    return doc


@api_router.delete("/subcategories/{item_id}")
async def delete_subcategory(item_id: str, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.subcategories.delete_one({"id": item_id})
    return {"ok": True}


# ---- Tags ----
@api_router.get("/tags")
async def list_tags(user: dict = Depends(get_current_user)):
    return await db.tags.find({}, {"_id": 0}).sort("name", 1).to_list(1000)


@api_router.post("/tags")
async def create_tag(data: TagInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR", "AUTHOR"))):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = await unique_slug(db.tags, data.name)
    doc["created_at"] = now_iso()
    await db.tags.insert_one(doc)
    return clean(doc)


@api_router.put("/tags/{item_id}")
async def update_tag(item_id: str, data: TagInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.tags.update_one({"id": item_id}, {"$set": data.model_dump()})
    doc = await db.tags.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Tag tidak ditemukan")
    return doc


@api_router.delete("/tags/{item_id}")
async def delete_tag(item_id: str, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.tags.delete_one({"id": item_id})
    return {"ok": True}


# ---- Collections ----
@api_router.get("/collections")
async def list_collections(user: dict = Depends(get_current_user)):
    cols = await db.collections.find({}, {"_id": 0}).sort("name", 1).to_list(500)
    for c in cols:
        c["post_count"] = await db.posts.count_documents({"collection_ids": c["id"]})
    return cols


@api_router.post("/collections")
async def create_collection(data: CollectionInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = await unique_slug(db.collections, data.name)
    doc["created_at"] = now_iso()
    await db.collections.insert_one(doc)
    return clean(doc)


@api_router.put("/collections/{item_id}")
async def update_collection(item_id: str, data: CollectionInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.collections.update_one({"id": item_id}, {"$set": data.model_dump()})
    doc = await db.collections.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Koleksi tidak ditemukan")
    return doc


@api_router.delete("/collections/{item_id}")
async def delete_collection(item_id: str, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.collections.delete_one({"id": item_id})
    return {"ok": True}


# ---- Surahs ----
@api_router.get("/surahs")
async def list_surahs(user: dict = Depends(get_current_user)):
    return await db.surahs.find({}, {"_id": 0}).sort("number", 1).to_list(200)


@api_router.post("/surahs")
async def create_surah(data: SurahInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.surahs.insert_one(doc)
    return clean(doc)


@api_router.put("/surahs/{item_id}")
async def update_surah(item_id: str, data: SurahInput, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.surahs.update_one({"id": item_id}, {"$set": data.model_dump()})
    doc = await db.surahs.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Surah tidak ditemukan")
    return doc


@api_router.delete("/surahs/{item_id}")
async def delete_surah(item_id: str, user: dict = Depends(require_roles("SUPER_ADMIN", "EDITOR"))):
    await db.surahs.delete_one({"id": item_id})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Posts
# ---------------------------------------------------------------------------
def validate_post(data: PostInput):
    if not data.title or not data.title.strip():
        raise HTTPException(422, "Judul wajib diisi")
    if not data.content or not data.content.strip():
        raise HTTPException(422, "Konten wajib diisi")
    if data.type == "ARTICLE" and not data.category_id:
        raise HTTPException(422, "Kategori wajib untuk Artikel")
    if data.type == "TADABBUR":
        if not data.surah_id:
            raise HTTPException(422, "Surah wajib untuk Tadabbur")
        if not data.ayat_number:
            raise HTTPException(422, "Nomor Ayat wajib untuk Tadabbur")


@api_router.get("/posts")
async def list_posts(
    type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    user: dict = Depends(get_current_user),
):
    q = {}
    if type:
        q["type"] = type
    if status:
        q["status"] = status
    if search:
        q["title"] = {"$regex": re.escape(search), "$options": "i"}
    posts = await db.posts.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [await enrich_post(p) for p in posts]


@api_router.get("/posts/{item_id}")
async def get_post(item_id: str, user: dict = Depends(get_current_user)):
    doc = await db.posts.find_one({"id": item_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Konten tidak ditemukan")
    return await enrich_post(doc)


@api_router.post("/posts")
async def create_post(data: PostInput, user: dict = Depends(get_current_user)):
    validate_post(data)
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = await unique_slug(db.posts, data.slug or data.title)
    doc["author_id"] = data.author_id or (await default_author_id())
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    if data.status == "PUBLISHED" and not doc.get("published_at"):
        doc["published_at"] = now_iso()
    await db.posts.insert_one(doc)
    return await enrich_post(clean(doc))


@api_router.put("/posts/{item_id}")
async def update_post(item_id: str, data: PostInput, user: dict = Depends(get_current_user)):
    existing = await db.posts.find_one({"id": item_id})
    if not existing:
        raise HTTPException(404, "Konten tidak ditemukan")
    if user["role"] == "AUTHOR" and existing.get("author_id") != user.get("author_id") and existing.get("created_by") != user["id"]:
        # authors may edit content they created
        pass
    validate_post(data)
    upd = data.model_dump()
    upd["slug"] = await unique_slug(db.posts, data.slug or data.title, exclude_id=item_id)
    upd["updated_at"] = now_iso()
    if data.status == "PUBLISHED" and not existing.get("published_at") and not upd.get("published_at"):
        upd["published_at"] = now_iso()
    await db.posts.update_one({"id": item_id}, {"$set": upd})
    doc = await db.posts.find_one({"id": item_id}, {"_id": 0})
    return await enrich_post(doc)


@api_router.delete("/posts/{item_id}")
async def delete_post(item_id: str, user: dict = Depends(get_current_user)):
    await db.posts.delete_one({"id": item_id})
    return {"ok": True}


async def default_author_id():
    a = await db.authors.find_one({"slug": "arief-sulistyanto"}, {"_id": 0})
    if a:
        return a["id"]
    a = await db.authors.find_one({}, {"_id": 0})
    return a["id"] if a else None


# ---------------------------------------------------------------------------
# Books
# ---------------------------------------------------------------------------
@api_router.get("/books")
async def list_books(user: dict = Depends(get_current_user)):
    books = await db.books.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for b in books:
        b["author"] = await db.authors.find_one({"id": b.get("author_id")}, {"_id": 0}) if b.get("author_id") else None
    return books


@api_router.post("/books")
async def create_book(data: BookInput, user: dict = Depends(get_current_user)):
    if not data.title.strip():
        raise HTTPException(422, "Judul wajib diisi")
    author_id = data.author_id or (await default_author_id())
    if not author_id:
        raise HTTPException(422, "Buku harus memiliki author")
    doc = data.model_dump()
    doc["author_id"] = author_id
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = await unique_slug(db.books, data.slug or data.title)
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    if data.status == "PUBLISHED" and not doc.get("published_at"):
        doc["published_at"] = now_iso()
    await db.books.insert_one(doc)
    return clean(doc)


@api_router.put("/books/{item_id}")
async def update_book(item_id: str, data: BookInput, user: dict = Depends(get_current_user)):
    existing = await db.books.find_one({"id": item_id})
    if not existing:
        raise HTTPException(404, "Buku tidak ditemukan")
    if not data.title.strip():
        raise HTTPException(422, "Judul wajib diisi")
    upd = data.model_dump()
    upd["author_id"] = data.author_id or existing.get("author_id") or (await default_author_id())
    if not upd["author_id"]:
        raise HTTPException(422, "Buku harus memiliki author")
    upd["slug"] = await unique_slug(db.books, data.slug or data.title, exclude_id=item_id)
    upd["updated_at"] = now_iso()
    if data.status == "PUBLISHED" and not existing.get("published_at") and not upd.get("published_at"):
        upd["published_at"] = now_iso()
    await db.books.update_one({"id": item_id}, {"$set": upd})
    doc = await db.books.find_one({"id": item_id}, {"_id": 0})
    return doc


@api_router.delete("/books/{item_id}")
async def delete_book(item_id: str, user: dict = Depends(get_current_user)):
    await db.books.delete_one({"id": item_id})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Risalahs
# ---------------------------------------------------------------------------
@api_router.get("/risalahs")
async def list_risalahs(user: dict = Depends(get_current_user)):
    items = await db.risalahs.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for b in items:
        b["author"] = await db.authors.find_one({"id": b.get("author_id")}, {"_id": 0}) if b.get("author_id") else None
    return items


@api_router.post("/risalahs")
async def create_risalah(data: RisalahInput, user: dict = Depends(get_current_user)):
    if not data.title.strip():
        raise HTTPException(422, "Judul wajib diisi")
    author_id = data.author_id or (await default_author_id())
    if not author_id:
        raise HTTPException(422, "Risalah harus memiliki author")
    doc = data.model_dump()
    doc["author_id"] = author_id
    doc["id"] = str(uuid.uuid4())
    doc["slug"] = await unique_slug(db.risalahs, data.slug or data.title)
    doc["created_at"] = now_iso()
    doc["updated_at"] = now_iso()
    if data.status == "PUBLISHED" and not doc.get("published_at"):
        doc["published_at"] = now_iso()
    await db.risalahs.insert_one(doc)
    return clean(doc)


@api_router.put("/risalahs/{item_id}")
async def update_risalah(item_id: str, data: RisalahInput, user: dict = Depends(get_current_user)):
    existing = await db.risalahs.find_one({"id": item_id})
    if not existing:
        raise HTTPException(404, "Risalah tidak ditemukan")
    if not data.title.strip():
        raise HTTPException(422, "Judul wajib diisi")
    upd = data.model_dump()
    upd["author_id"] = data.author_id or existing.get("author_id") or (await default_author_id())
    if not upd["author_id"]:
        raise HTTPException(422, "Risalah harus memiliki author")
    upd["slug"] = await unique_slug(db.risalahs, data.slug or data.title, exclude_id=item_id)
    upd["updated_at"] = now_iso()
    if data.status == "PUBLISHED" and not existing.get("published_at") and not upd.get("published_at"):
        upd["published_at"] = now_iso()
    await db.risalahs.update_one({"id": item_id}, {"$set": upd})
    doc = await db.risalahs.find_one({"id": item_id}, {"_id": 0})
    return doc


@api_router.delete("/risalahs/{item_id}")
async def delete_risalah(item_id: str, user: dict = Depends(get_current_user)):
    await db.risalahs.delete_one({"id": item_id})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Users (SUPER_ADMIN only)
# ---------------------------------------------------------------------------
@api_router.get("/users")
async def list_users(user: dict = Depends(require_roles("SUPER_ADMIN"))):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    return users


@api_router.post("/users")
async def create_user(data: UserCreate, user: dict = Depends(require_roles("SUPER_ADMIN"))):
    if data.role not in ROLES:
        raise HTTPException(422, "Peran tidak valid")
    email = data.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(422, "Email sudah terdaftar")
    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": email,
        "password_hash": hash_password(data.password),
        "role": data.role,
        "avatar": "",
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.users.insert_one(doc)
    clean(doc)
    doc.pop("password_hash", None)
    return doc


@api_router.put("/users/{item_id}")
async def update_user(item_id: str, data: UserUpdate, user: dict = Depends(require_roles("SUPER_ADMIN"))):
    existing = await db.users.find_one({"id": item_id})
    if not existing:
        raise HTTPException(404, "Pengguna tidak ditemukan")
    upd = {}
    if data.name is not None:
        upd["name"] = data.name
    if data.email is not None:
        upd["email"] = data.email.lower()
    if data.role is not None:
        if data.role not in ROLES:
            raise HTTPException(422, "Peran tidak valid")
        upd["role"] = data.role
    if data.password:
        upd["password_hash"] = hash_password(data.password)
    upd["updated_at"] = now_iso()
    await db.users.update_one({"id": item_id}, {"$set": upd})
    doc = await db.users.find_one({"id": item_id}, {"_id": 0, "password_hash": 0})
    return doc


@api_router.delete("/users/{item_id}")
async def delete_user(item_id: str, user: dict = Depends(require_roles("SUPER_ADMIN"))):
    if item_id == user["id"]:
        raise HTTPException(422, "Tidak dapat menghapus akun sendiri")
    await db.users.delete_one({"id": item_id})
    return {"ok": True}


@api_router.get("/roles")
async def get_roles(user: dict = Depends(get_current_user)):
    return [
        {"role": "SUPER_ADMIN", "label": "Super Admin", "description": "Akses penuh sistem, manajemen pengguna, pengaturan, dan seluruh konten."},
        {"role": "EDITOR", "label": "Editor", "description": "Mengelola konten, kategori, tag, koleksi, dan media."},
        {"role": "AUTHOR", "label": "Author", "description": "Membuat dan menyunting karya tulisan sendiri. Tidak dapat mengelola pengguna atau pengaturan."},
    ]


# ---------------------------------------------------------------------------
# Media
# ---------------------------------------------------------------------------
@api_router.get("/media")
async def list_media(type: Optional[str] = None, user: dict = Depends(get_current_user)):
    q = {"is_deleted": {"$ne": True}}
    if type:
        q["type"] = type
    return await db.media.find(q, {"_id": 0}).sort("created_at", -1).to_list(1000)


@api_router.post("/media/upload")
async def upload_media(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXT:
        raise HTTPException(422, f"Tipe file tidak didukung: .{ext}")
    data = await file.read()
    path = f"{APP_NAME}/media/{user['id']}/{uuid.uuid4()}.{ext}"
    content_type = MIME_TYPES.get(ext, file.content_type or "application/octet-stream")
    try:
        result = put_object(path, data, content_type)
    except Exception as e:
        logger.error(f"Upload gagal: {e}")
        raise HTTPException(502, "Gagal mengunggah file ke penyimpanan")
    doc = {
        "id": str(uuid.uuid4()),
        "filename": file.filename,
        "type": content_type,
        "ext": ext,
        "size": result.get("size", len(data)),
        "path": result["path"],
        "url": f"/api/media/file/{result['path']}",
        "uploaded_by": user["id"],
        "uploaded_by_name": user.get("name", ""),
        "is_deleted": False,
        "created_at": now_iso(),
    }
    await db.media.insert_one(doc)
    return clean(doc)


@api_router.delete("/media/{item_id}")
async def delete_media(item_id: str, user: dict = Depends(get_current_user)):
    await db.media.update_one({"id": item_id}, {"$set": {"is_deleted": True}})
    return {"ok": True}


@api_router.get("/media/file/{path:path}")
async def serve_media(path: str):
    record = await db.media.find_one({"path": path, "is_deleted": {"$ne": True}})
    if not record:
        raise HTTPException(404, "File tidak ditemukan")
    try:
        content, content_type = get_object(path)
    except Exception:
        raise HTTPException(404, "File tidak dapat diambil")
    return Response(content=content, media_type=record.get("type", content_type))


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------
DEFAULT_SETTINGS = {
    "id": "site-settings",
    "general": {
        "title": "Cahaya Kehidupan",
        "tagline": "Kehidupan yang Diterangi Cahaya Tidak Akan Kehilangan Arah",
        "author_bio": "Arief Sulistyanto — penulis, pemikir, dan penghimpun tadabbur, artikel, buku, serta risalah.",
        "footer_text": "© Cahaya Kehidupan. Seluruh karya oleh Arief Sulistyanto.",
        "logo": "",
    },
    "seo": {
        "meta_title": "Cahaya Kehidupan — Digital Knowledge & Writing Platform",
        "meta_description": "Menghimpun tadabbur, artikel, buku, dan risalah karya Arief Sulistyanto.",
        "og_image": "",
        "search_console_code": "",
        "robots_index": True,
    },
    "homepage": {
        "hero_title": "Cahaya Kehidupan",
        "hero_subtitle": "Kehidupan yang Diterangi Cahaya Tidak Akan Kehilangan Arah",
        "featured_collection_id": "",
        "show_latest_tadabbur": True,
    },
}


@api_router.get("/settings")
async def get_settings(user: dict = Depends(get_current_user)):
    doc = await db.settings.find_one({"id": "site-settings"}, {"_id": 0})
    if not doc:
        await db.settings.insert_one(dict(DEFAULT_SETTINGS))
        return DEFAULT_SETTINGS
    return doc


@api_router.put("/settings")
async def update_settings(data: SettingsInput, user: dict = Depends(require_roles("SUPER_ADMIN"))):
    upd = {}
    if data.general is not None:
        upd["general"] = data.general
    if data.seo is not None:
        upd["seo"] = data.seo
    if data.homepage is not None:
        upd["homepage"] = data.homepage
    await db.settings.update_one({"id": "site-settings"}, {"$set": upd}, upsert=True)
    doc = await db.settings.find_one({"id": "site-settings"}, {"_id": 0})
    return doc


# ---------------------------------------------------------------------------
# PUBLIC (no auth) — only PUBLISHED content
# ---------------------------------------------------------------------------
async def public_enrich(p: dict) -> dict:
    p = await enrich_post(p)
    p["tags"] = await db.tags.find({"id": {"$in": p.get("tag_ids", [])}}, {"_id": 0}).to_list(100)
    p["collections"] = await db.collections.find({"id": {"$in": p.get("collection_ids", [])}}, {"_id": 0}).to_list(100)
    return p


def card(p: dict) -> dict:
    return {
        "id": p["id"],
        "title": p["title"],
        "slug": p["slug"],
        "subtitle": p.get("subtitle", ""),
        "excerpt": p.get("excerpt", ""),
        "content": p.get("content", ""),
        "cover_image": p.get("cover_image", ""),
        "video_url": p.get("video_url", ""),
        "gallery_images": p.get("gallery_images", []),
        "type": p.get("type"),
        "published_at": p.get("published_at"),
        "created_at": p.get("created_at"),
        "category": p.get("category"),
        "subcategory": p.get("subcategory"),
        "surah": p.get("surah"),
        "author": p.get("author"),
        "ayat_number": p.get("ayat_number"),
        "theme": p.get("theme"),
    }


@public_router.get("/settings")
async def pub_settings():
    doc = await db.settings.find_one({"id": "site-settings"}, {"_id": 0})
    return doc or DEFAULT_SETTINGS


@public_router.get("/home")
async def pub_home():
    settings = await db.settings.find_one({"id": "site-settings"}, {"_id": 0}) or DEFAULT_SETTINGS
    latest_raw = await db.posts.find({"status": "PUBLISHED"}, {"_id": 0}).sort("published_at", -1).to_list(6)
    latest = [card(await public_enrich(p)) for p in latest_raw]

    cahaya_hikmah_raw = await db.posts.find(
        {"status": "PUBLISHED", "type": "CAHAYA_HIKMAH"},
        {"_id": 0}
    ).sort("published_at", -1).to_list(4)

    cahaya_hikmah = [
        card(await public_enrich(p))
        for p in cahaya_hikmah_raw
    ]

    cats = await db.categories.find({}, {"_id": 0}).sort("name", 1).to_list(50)
    for c in cats:
        c["count"] = await db.posts.count_documents({"category_id": c["id"], "status": "PUBLISHED"})

    books = await db.books.find({"status": "PUBLISHED"}, {"_id": 0}).sort("published_at", -1).to_list(4)
    for b in books:
        b["author"] = await db.authors.find_one({"id": b.get("author_id")}, {"_id": 0}) if b.get("author_id") else None
    risalahs = await db.risalahs.find({"status": "PUBLISHED"}, {"_id": 0}).sort("published_at", -1).to_list(4)
    for b in risalahs:
        b["author"] = await db.authors.find_one({"id": b.get("author_id")}, {"_id": 0}) if b.get("author_id") else None

    cols = await db.collections.find({"status": "PUBLISHED"}, {"_id": 0}).sort("created_at", -1).to_list(6)
    for c in cols:
        c["count"] = await db.posts.count_documents({"collection_ids": c["id"], "status": "PUBLISHED"})

    author = await db.authors.find_one({"slug": "arief-sulistyanto"}, {"_id": 0}) or await db.authors.find_one({}, {"_id": 0})

    return {
    "settings": settings,
    "latest": latest,
    "cahaya_hikmah": cahaya_hikmah,
    "categories": cats,
    "books": books,
    "risalahs": risalahs,
    "collections": cols,
    "author": author
}


@public_router.get("/posts")
async def pub_posts(type: Optional[str] = None, category: Optional[str] = None, subcategory: Optional[str] = None,
                    tag: Optional[str] = None, collection: Optional[str] = None, search: Optional[str] = None):
    q = {"status": "PUBLISHED"}
    if type:
        q["type"] = type
    if category:
        c = await db.categories.find_one({"slug": category})
        q["category_id"] = c["id"] if c else "__none__"
    if subcategory:
        s = await db.subcategories.find_one({"slug": subcategory})
        q["subcategory_id"] = s["id"] if s else "__none__"
    if tag:
        t = await db.tags.find_one({"slug": tag})
        q["tag_ids"] = t["id"] if t else "__none__"
    if collection:
        col = await db.collections.find_one({"slug": collection})
        q["collection_ids"] = col["id"] if col else "__none__"
    if search:
        q["$or"] = [
            {"title": {"$regex": re.escape(search), "$options": "i"}},
            {"subtitle": {"$regex": re.escape(search), "$options": "i"}},
            {"excerpt": {"$regex": re.escape(search), "$options": "i"}},
        ]
    posts = await db.posts.find(q, {"_id": 0}).sort("published_at", -1).to_list(500)
    return [card(await public_enrich(p)) for p in posts]


@public_router.get("/post/{slug}")
async def pub_post(slug: str):
    p = await db.posts.find_one({"slug": slug, "status": "PUBLISHED"}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Tulisan tidak ditemukan")
    enriched = await public_enrich(p)
    related_q = {"status": "PUBLISHED", "id": {"$ne": p["id"]}, "type": p["type"]}
    if p.get("category_id"):
        related_q["category_id"] = p["category_id"]
    related = await db.posts.find(related_q, {"_id": 0}).sort("published_at", -1).to_list(3)
    enriched["related"] = [card(await public_enrich(r)) for r in related]
    return enriched


@public_router.get("/categories")
async def pub_categories():
    cats = await db.categories.find({}, {"_id": 0}).sort("name", 1).to_list(100)
    subs = await db.subcategories.find({}, {"_id": 0}).sort("name", 1).to_list(200)
    for c in cats:
        c["count"] = await db.posts.count_documents({"category_id": c["id"], "status": "PUBLISHED"})
        c["subcategories"] = [s for s in subs if s.get("category_id") == c["id"]]
    return cats


@public_router.get("/tags")
async def pub_tags():
    tags = await db.tags.find({}, {"_id": 0}).sort("name", 1).to_list(500)
    for t in tags:
        t["count"] = await db.posts.count_documents({"tag_ids": t["id"], "status": "PUBLISHED"})
    return [t for t in tags if t["count"] > 0]


@public_router.get("/tadabbur/surahs")
async def pub_tadabbur_surahs():
    surahs = await db.surahs.find({}, {"_id": 0}).sort("number", 1).to_list(200)
    out = []
    for s in surahs:
        count = await db.posts.count_documents({"surah_id": s["id"], "type": "TADABBUR", "status": "PUBLISHED"})
        if count > 0:
            s["slug"] = slugify(s["name"])
            s["count"] = count
            out.append(s)
    return out


@public_router.get("/tadabbur/surah/{slug}")
async def pub_tadabbur_surah(slug: str):
    surahs = await db.surahs.find({}, {"_id": 0}).to_list(200)
    surah = next((s for s in surahs if slugify(s["name"]) == slug or str(s["number"]) == slug), None)
    if not surah:
        raise HTTPException(404, "Surah tidak ditemukan")
    posts = await db.posts.find({"surah_id": surah["id"], "type": "TADABBUR", "status": "PUBLISHED"}, {"_id": 0}).to_list(500)
    surah["slug"] = slugify(surah["name"])
    return {"surah": surah, "posts": [card(await public_enrich(p)) for p in posts]}


@public_router.get("/books")
async def pub_books():
    books = await db.books.find({"status": "PUBLISHED"}, {"_id": 0}).sort("published_at", -1).to_list(200)
    for b in books:
        b["author"] = await db.authors.find_one({"id": b.get("author_id")}, {"_id": 0}) if b.get("author_id") else None
    return books


@public_router.get("/book/{slug}")
async def pub_book(slug: str, user: Optional[dict] = Depends(get_optional_user)):
    b = await db.books.find_one({"slug": slug, "status": "PUBLISHED"}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Buku tidak ditemukan")
    b["author"] = await db.authors.find_one({"id": b.get("author_id")}, {"_id": 0}) if b.get("author_id") else None
    if not user:
        b["locked"] = True
        b["content"] = ""
        b["pdf_file"] = ""
    else:
        b["locked"] = False
    return b


@public_router.get("/risalahs")
async def pub_risalahs():
    items = await db.risalahs.find({"status": "PUBLISHED"}, {"_id": 0}).sort("published_at", -1).to_list(200)
    for b in items:
        b["author"] = await db.authors.find_one({"id": b.get("author_id")}, {"_id": 0}) if b.get("author_id") else None
    return items


@public_router.get("/risalah/{slug}")
async def pub_risalah(slug: str, user: Optional[dict] = Depends(get_optional_user)):
    b = await db.risalahs.find_one({"slug": slug, "status": "PUBLISHED"}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Risalah tidak ditemukan")
    b["author"] = await db.authors.find_one({"id": b.get("author_id")}, {"_id": 0}) if b.get("author_id") else None
    if not user:
        b["locked"] = True
        b["content"] = ""
        b["pdf_file"] = ""
    else:
        b["locked"] = False
    return b


@public_router.get("/collections")
async def pub_collections():
    cols = await db.collections.find({"status": "PUBLISHED"}, {"_id": 0}).sort("name", 1).to_list(200)
    for c in cols:
        c["count"] = await db.posts.count_documents({"collection_ids": c["id"], "status": "PUBLISHED"})
    return cols


@public_router.get("/collection/{slug}")
async def pub_collection(slug: str):
    c = await db.collections.find_one({"slug": slug, "status": "PUBLISHED"}, {"_id": 0})
    if not c:
        raise HTTPException(404, "Koleksi tidak ditemukan")
    posts = await db.posts.find({"collection_ids": c["id"], "status": "PUBLISHED"}, {"_id": 0}).sort("published_at", -1).to_list(500)
    c["posts"] = [card(await public_enrich(p)) for p in posts]
    c["count"] = len(posts)
    return c


@public_router.get("/about")
async def pub_about():
    author = await db.authors.find_one({"slug": "arief-sulistyanto"}, {"_id": 0}) or await db.authors.find_one({}, {"_id": 0})
    settings = await db.settings.find_one({"id": "site-settings"}, {"_id": 0}) or DEFAULT_SETTINGS
    stats = {
        "articles": await db.posts.count_documents({"type": "ARTICLE", "status": "PUBLISHED"}),
        "tadabbur": await db.posts.count_documents({"type": "TADABBUR", "status": "PUBLISHED"}),
        "books": await db.books.count_documents({"status": "PUBLISHED"}),
        "risalahs": await db.risalahs.count_documents({"status": "PUBLISHED"}),
    }
    latest = await db.posts.find({"status": "PUBLISHED"}, {"_id": 0}).sort("published_at", -1).to_list(4)
    return {"author": author, "settings": settings, "stats": stats, "latest": [card(await public_enrich(p)) for p in latest]}


@public_router.get("/search")
async def pub_search(q: str = ""):
    if not q or len(q.strip()) < 1:
        return {"query": q, "tadabbur": [], "articles": [], "books": [], "risalahs": [], "collections": []}
    rx = {"$regex": re.escape(q), "$options": "i"}
    post_or = [{"title": rx}, {"subtitle": rx}, {"excerpt": rx}, {"content": rx}, {"theme": rx}]
    posts = await db.posts.find({"status": "PUBLISHED", "$or": post_or}, {"_id": 0}).sort("published_at", -1).to_list(200)
    enriched = [card(await public_enrich(p)) for p in posts]
    articles = [p for p in enriched if p["type"] == "ARTICLE"]
    tadabbur = [p for p in enriched if p["type"] == "TADABBUR"]

    book_docs = await db.books.find({"status": "PUBLISHED", "$or": [{"title": rx}, {"subtitle": rx}, {"description": rx}, {"content": rx}]}, {"_id": 0}).to_list(100)
    for b in book_docs:
        b["author"] = await db.authors.find_one({"id": b.get("author_id")}, {"_id": 0}) if b.get("author_id") else None
    ris_docs = await db.risalahs.find({"status": "PUBLISHED", "$or": [{"title": rx}, {"subtitle": rx}, {"description": rx}, {"content": rx}]}, {"_id": 0}).to_list(100)
    for b in ris_docs:
        b["author"] = await db.authors.find_one({"id": b.get("author_id")}, {"_id": 0}) if b.get("author_id") else None
    col_docs = await db.collections.find({"status": "PUBLISHED", "$or": [{"name": rx}, {"description": rx}]}, {"_id": 0}).to_list(100)
    for c in col_docs:
        c["count"] = await db.posts.count_documents({"collection_ids": c["id"], "status": "PUBLISHED"})
    return {"query": q, "tadabbur": tadabbur, "articles": articles, "books": book_docs, "risalahs": ris_docs, "collections": col_docs}


# ---------------------------------------------------------------------------
# App wiring
# ---------------------------------------------------------------------------
app.include_router(api_router)
app.include_router(public_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.posts.create_index("slug", unique=True)
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    from seed import run_seed
    await run_seed(db, hash_password)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
