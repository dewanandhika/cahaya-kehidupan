"""Idempotent demo seed data for Cahaya Kehidupan CMS."""
import os
import uuid
from datetime import datetime, timezone, timedelta


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def slugify(text):
    import re
    text = (text or "").lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-") or "untitled"


SUBCATEGORIES = [
    "Refleksi Kehidupan",
    "Kebangsaan & Sosial",
    "Hukum & Keadilan",
    "Kepemimpinan",
    "Pendidikan & Peradaban",
    "Pemikiran",
]

CATEGORIES = ["Pemikiran", "Sosial & Kebangsaan", "Spiritualitas"]

TAGS = [
    "Hikmah", "Kepemimpinan", "Keadilan", "Pendidikan", "Peradaban",
    "Kebangsaan", "Sabar", "Tauhid", "Akhlak", "Refleksi",
]

COLLECTIONS = [
    ("Seri Renungan Pagi", "Kumpulan renungan singkat untuk memulai hari dengan cahaya."),
    ("Jejak Peradaban", "Refleksi tentang sejarah, ilmu, dan peradaban manusia."),
    ("Cahaya Kepemimpinan", "Gagasan tentang kepemimpinan yang adil dan berhikmah."),
    ("Tadabbur Pilihan", "Kumpulan tadabbur ayat pilihan yang menyentuh hati."),
    ("Risalah Kebangsaan", "Naskah pemikiran tentang bangsa, sosial, dan keadilan."),
]

SURAHS = [
    ("Al-Fatihah", "الفاتحة", 1, 7),
    ("Al-Baqarah", "البقرة", 2, 286),
    ("Ali 'Imran", "آل عمران", 3, 200),
    ("An-Nisa", "النساء", 4, 176),
    ("Al-Ma'idah", "المائدة", 5, 120),
    ("Al-An'am", "الأنعام", 6, 165),
    ("Al-A'raf", "الأعراف", 7, 206),
    ("Yusuf", "يوسف", 12, 111),
    ("Ar-Ra'd", "الرعد", 13, 43),
    ("Ibrahim", "إبراهيم", 14, 52),
    ("Al-Kahf", "الكهف", 18, 110),
    ("Luqman", "لقمان", 31, 34),
    ("Yasin", "يس", 36, 83),
    ("Ar-Rahman", "الرحمن", 55, 78),
    ("Al-Hujurat", "الحجرات", 49, 18),
]

ARTICLE_TITLES = [
    ("Susah Melihat Orang Senang", "Refleksi Kehidupan", "Tentang penyakit hati yang membuat kita gelisah melihat kebahagiaan orang lain."),
    ("Menimbang Ulang Makna Keadilan", "Hukum & Keadilan", "Keadilan bukan sekadar hukum, melainkan keberpihakan pada yang benar."),
    ("Pemimpin yang Mendengar", "Kepemimpinan", "Kepemimpinan sejati lahir dari kesediaan untuk mendengarkan."),
    ("Pendidikan sebagai Cahaya Peradaban", "Pendidikan & Peradaban", "Bangsa besar dibangun di atas fondasi pendidikan yang memerdekakan."),
    ("Bangsa yang Kehilangan Arah", "Kebangsaan & Sosial", "Renungan tentang arah kebangsaan di tengah zaman yang bergegas."),
    ("Berpikir Jernih di Tengah Kegaduhan", "Pemikiran", "Menjaga kejernihan berpikir ketika informasi datang bertubi-tubi."),
    ("Sabar yang Bukan Kelemahan", "Refleksi Kehidupan", "Sabar adalah kekuatan yang tenang, bukan kepasrahan yang lemah."),
    ("Hukum yang Berpihak pada Manusia", "Hukum & Keadilan", "Hukum seharusnya melindungi, bukan menakuti yang lemah."),
    ("Melatih Kepemimpinan Diri", "Kepemimpinan", "Sebelum memimpin orang lain, pimpinlah diri sendiri."),
    ("Warisan Ilmu para Ulama", "Pendidikan & Peradaban", "Menelusuri jejak ilmu yang diwariskan lintas generasi."),
]

TADABBUR_TITLES = [
    ("Tadabbur Ayat Kursi: Kebesaran yang Menenangkan", "Al-Baqarah", "255", "Ketauhidan"),
    ("Sabar dan Shalat sebagai Penolong", "Al-Baqarah", "153", "Sabar"),
    ("Janji Kemudahan Setelah Kesulitan", "Ar-Rahman", "13", "Syukur"),
    ("Nasihat Luqman kepada Anaknya", "Luqman", "13", "Pendidikan"),
    ("Cahaya di Atas Cahaya", "An-Nur", "35", "Ma'rifat"),
    ("Keadilan yang Diperintahkan", "An-Nisa", "58", "Keadilan"),
    ("Berpegang pada Tali Allah", "Ali 'Imran", "103", "Persatuan"),
    ("Kisah Ashabul Kahfi", "Al-Kahf", "10", "Keteguhan Iman"),
    ("Kesabaran Nabi Yusuf", "Yusuf", "18", "Sabar"),
    ("Perumpamaan Kalimat yang Baik", "Ibrahim", "24", "Akhlak"),
]

BOOKS = [
    ("Cahaya yang Tak Padam", "Kumpulan Esai Kehidupan", "Renungan panjang tentang makna hidup yang diterangi cahaya iman.", "2021"),
    ("Jalan Keadilan", "Menimbang Hukum dan Nurani", "Telaah kritis tentang keadilan dalam kehidupan berbangsa.", "2022"),
    ("Peradaban yang Menua", "Refleksi Sejarah dan Masa Depan", "Perjalanan peradaban dan pelajaran bagi generasi hari ini.", "2023"),
    ("Memimpin dengan Hati", "Etika Kepemimpinan", "Prinsip-prinsip kepemimpinan yang berlandaskan hikmah.", "2024"),
    ("Menemukan Arah", "Panduan Refleksi Diri", "Panduan praktis menemukan arah hidup di tengah kebisingan zaman.", "2025"),
]

RISALAHS = [
    ("Risalah Kebangsaan", "Tentang Cinta Tanah Air", "Naskah pemikiran mengenai makna kebangsaan dan tanggung jawab warga."),
    ("Risalah Keadilan Sosial", "Menegakkan yang Benar", "Gagasan tentang keadilan sosial bagi seluruh rakyat."),
    ("Risalah Pendidikan", "Mencerdaskan Kehidupan", "Pemikiran tentang arah pendidikan yang memerdekakan."),
    ("Risalah Kepemimpinan", "Amanah dan Tanggung Jawab", "Refleksi kepemimpinan sebagai amanah yang berat."),
    ("Risalah Refleksi", "Menata Hati", "Kumpulan renungan singkat untuk menata hati dan niat."),
]

DUMMY_CONTENT = (
    "Dalam perjalanan hidup, manusia kerap dihadapkan pada persimpangan yang menuntut "
    "kejernihan hati dan pikiran. Tulisan ini mengajak pembaca merenung lebih dalam, "
    "menimbang setiap langkah dengan cahaya hikmah, dan menemukan arah yang benar.\n\n"
    "Cahaya bukan sekadar penerang jalan, melainkan penuntun yang menjaga kita agar tidak "
    "kehilangan arah. Ketika kehidupan diterangi cahaya, setiap ujian menjadi pelajaran, "
    "dan setiap pertemuan menjadi kebermaknaan.\n\n"
    "Semoga renungan ini menjadi titik mula bagi perjalanan yang lebih bermakna."
)


async def run_seed(db, hash_password):
    if await db.authors.count_documents({}) > 0 and await db.posts.count_documents({}) > 0:
        return

    # Author
    author = await db.authors.find_one({"slug": "arief-sulistyanto"})
    if not author:
        author = {
            "id": str(uuid.uuid4()),
            "name": "Arief Sulistyanto",
            "slug": "arief-sulistyanto",
            "bio": "Penulis, pemikir, dan penghimpun tadabbur, artikel, buku, serta risalah. Karya-karyanya berfokus pada refleksi kehidupan, kebangsaan, keadilan, dan peradaban.",
            "avatar": "",
            "created_at": now_iso(),
        }
        await db.authors.insert_one(dict(author))
    author_id = author["id"]

    # Categories
    cat_map = {}
    for name in CATEGORIES:
        doc = {"id": str(uuid.uuid4()), "name": name, "slug": slugify(name), "description": "", "created_at": now_iso()}
        await db.categories.insert_one(dict(doc))
        cat_map[name] = doc["id"]
    default_cat = cat_map["Pemikiran"]

    # Subcategories (mapped under a category)
    sub_map = {}
    for name in SUBCATEGORIES:
        doc = {"id": str(uuid.uuid4()), "name": name, "slug": slugify(name), "category_id": default_cat, "description": "", "created_at": now_iso()}
        await db.subcategories.insert_one(dict(doc))
        sub_map[name] = doc["id"]

    # Tags
    tag_ids = []
    for name in TAGS:
        doc = {"id": str(uuid.uuid4()), "name": name, "slug": slugify(name), "created_at": now_iso()}
        await db.tags.insert_one(dict(doc))
        tag_ids.append(doc["id"])

    # Collections
    collection_ids = []
    for name, desc in COLLECTIONS:
        doc = {"id": str(uuid.uuid4()), "name": name, "slug": slugify(name), "description": desc, "cover": "", "status": "PUBLISHED", "created_at": now_iso()}
        await db.collections.insert_one(dict(doc))
        collection_ids.append(doc["id"])

    # Surahs
    surah_map = {}
    for name, arabic, number, total in SURAHS:
        doc = {"id": str(uuid.uuid4()), "name": name, "arabic_name": arabic, "number": number, "total_ayah": total, "created_at": now_iso()}
        await db.surahs.insert_one(dict(doc))
        surah_map[name] = doc["id"]

    base = datetime.now(timezone.utc)

    # Articles
    for i, (title, sub, excerpt) in enumerate(ARTICLE_TITLES):
        status = "PUBLISHED" if i % 3 != 2 else "DRAFT"
        created = (base - timedelta(days=i)).isoformat()
        doc = {
            "id": str(uuid.uuid4()),
            "title": title,
            "slug": slugify(title),
            "subtitle": sub,
            "excerpt": excerpt,
            "content": DUMMY_CONTENT,
            "cover_image": "",
            "type": "ARTICLE",
            "status": status,
            "author_id": author_id,
            "category_id": default_cat,
            "subcategory_id": sub_map.get(sub),
            "tag_ids": [tag_ids[i % len(tag_ids)], tag_ids[(i + 3) % len(tag_ids)]],
            "collection_ids": [collection_ids[i % len(collection_ids)]],
            "surah_id": None, "ayat_number": None, "theme": None,
            "published_at": created if status == "PUBLISHED" else None,
            "created_at": created,
            "updated_at": created,
        }
        await db.posts.insert_one(dict(doc))

    # Tadabbur
    for i, (title, surah_name, ayat, theme) in enumerate(TADABBUR_TITLES):
        status = "PUBLISHED" if i % 3 != 2 else "DRAFT"
        created = (base - timedelta(days=i, hours=5)).isoformat()
        doc = {
            "id": str(uuid.uuid4()),
            "title": title,
            "slug": slugify(title),
            "subtitle": f"Tadabbur {surah_name}",
            "excerpt": f"Renungan atas {surah_name} ayat {ayat} bertema {theme}.",
            "content": DUMMY_CONTENT,
            "cover_image": "",
            "type": "TADABBUR",
            "status": status,
            "author_id": author_id,
            "category_id": None,
            "subcategory_id": None,
            "tag_ids": [tag_ids[(i + 1) % len(tag_ids)]],
            "collection_ids": [collection_ids[3]],
            "surah_id": surah_map.get(surah_name) or list(surah_map.values())[i % len(surah_map)],
            "ayat_number": ayat,
            "theme": theme,
            "published_at": created if status == "PUBLISHED" else None,
            "created_at": created,
            "updated_at": created,
        }
        await db.posts.insert_one(dict(doc))

    # Books
    for i, (title, subtitle, desc, year) in enumerate(BOOKS):
        status = "PUBLISHED" if i % 4 != 3 else "DRAFT"
        created = (base - timedelta(days=i * 10)).isoformat()
        doc = {
            "id": str(uuid.uuid4()),
            "title": title,
            "slug": slugify(title),
            "subtitle": subtitle,
            "author_id": author_id,
            "cover": "",
            "description": desc,
            "year": year,
            "content": DUMMY_CONTENT,
            "pdf_file": "",
            "download_enabled": i % 2 == 0,
            "status": status,
            "published_at": created if status == "PUBLISHED" else None,
            "created_at": created,
            "updated_at": created,
        }
        await db.books.insert_one(dict(doc))

    # Risalahs
    for i, (title, subtitle, desc) in enumerate(RISALAHS):
        status = "PUBLISHED" if i % 4 != 3 else "DRAFT"
        created = (base - timedelta(days=i * 7)).isoformat()
        doc = {
            "id": str(uuid.uuid4()),
            "title": title,
            "slug": slugify(title),
            "subtitle": subtitle,
            "author_id": author_id,
            "cover": "",
            "description": desc,
            "content": DUMMY_CONTENT,
            "pdf_file": "",
            "download_enabled": i % 2 == 1,
            "status": status,
            "published_at": created if status == "PUBLISHED" else None,
            "created_at": created,
            "updated_at": created,
        }
        await db.risalahs.insert_one(dict(doc))

    # Users (10 total incl admin). Admin from env.
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@cahayakehidupan.id").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Cahaya2026!")
    if not await db.users.find_one({"email": admin_email}):
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "name": "Arief Sulistyanto", "email": admin_email,
            "password_hash": hash_password(admin_password), "role": "SUPER_ADMIN",
            "avatar": "", "created_at": now_iso(), "updated_at": now_iso(),
        })

    demo_users = [
        ("Editor Utama", "editor@cahayakehidupan.id", "EDITOR"),
        ("Editor Konten", "editor2@cahayakehidupan.id", "EDITOR"),
        ("Penulis Tamu", "author1@cahayakehidupan.id", "AUTHOR"),
        ("Penulis Refleksi", "author2@cahayakehidupan.id", "AUTHOR"),
        ("Penulis Tadabbur", "author3@cahayakehidupan.id", "AUTHOR"),
        ("Kontributor Sosial", "author4@cahayakehidupan.id", "AUTHOR"),
        ("Kontributor Hukum", "author5@cahayakehidupan.id", "AUTHOR"),
        ("Editor Junior", "editor3@cahayakehidupan.id", "EDITOR"),
        ("Admin Kedua", "admin2@cahayakehidupan.id", "SUPER_ADMIN"),
    ]
    for name, email, role in demo_users:
        if not await db.users.find_one({"email": email}):
            await db.users.insert_one({
                "id": str(uuid.uuid4()), "name": name, "email": email,
                "password_hash": hash_password("Cahaya2026!"), "role": role,
                "avatar": "", "created_at": now_iso(), "updated_at": now_iso(),
            })
