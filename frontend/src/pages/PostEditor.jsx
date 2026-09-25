import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { PageHeader, Btn, Field, Spinner } from "@/components/ck";
import MediaPicker from "@/components/MediaPicker";
import RichTextEditor from "@/components/RichTextEditor";
import { Save, Send, ArrowLeft } from "lucide-react";

function slugify(t) {
  return (t || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const empty = {
  title: "",
  subtitle: "",
  excerpt: "",
  content: "",
  cover_image: "",
  pdf_file: "",
  download_enabled: false,
  video_url: "",
  gallery_images: [],
  type: "ARTICLE",
  status: "DRAFT",
  author_id: "",
  category_id: "",
  subcategory_id: "",
  tag_ids: [],
  collection_ids: [],
  published_at: "",
  surah_id: "",
  ayat_number: "",
  theme: "",
  slug: "",
};

export default function PostEditor() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...empty,
    type: sp.get("type") || "ARTICLE",
  });

  const [slugTouched, setSlugTouched] = useState(false);
  const [refs, setRefs] = useState(null);
  const [saving, setSaving] = useState(false);

  const isEdit = !!id;

  useEffect(() => {
    Promise.all([
      api.get("/authors"),
      api.get("/categories"),
      api.get("/subcategories"),
      api.get("/tags"),
      api.get("/collections"),
      api.get("/surahs"),
    ])
      .then(([a, c, s, t, col, su]) => {
        setRefs({
          authors: a.data,
          categories: c.data,
          subcategories: s.data,
          tags: t.data,
          collections: col.data,
          surahs: su.data,
        });
      })
      .catch(() => {
        toast.error("Gagal memuat referensi data");
      });

    if (isEdit) {
      api
        .get(`/posts/${id}`)
        .then((r) => {
          const p = r.data;

          setForm({
            ...empty,
            ...p,
            video_url: p.video_url || "",
            published_at: p.published_at
              ? p.published_at.slice(0, 16)
              : "",
          });

          setSlugTouched(true);
        })
        .catch(() => {
          toast.error("Konten tidak ditemukan");
          navigate("/admin/posts");
        });
    }
  }, [id, isEdit, navigate]);

  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const onTitle = (value) => {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugTouched ? current.slug : slugify(value),
    }));
  };

  const filteredSubs = useMemo(
    () =>
      (refs?.subcategories || []).filter(
        (s) =>
          !form.category_id ||
          !s.category_id ||
          s.category_id === form.category_id
      ),
    [refs, form.category_id]
  );

  const toggleArr = (key, value) => {
    setForm((current) => {
      const currentArray = current[key] || [];

      const newArray = currentArray.includes(value)
        ? currentArray.filter((x) => x !== value)
        : [...currentArray, value];

      return {
        ...current,
        [key]: newArray,
      };
    });
  };

  const submit = async (status) => {
    const payload = {
      ...form,
      status,
      published_at: form.published_at
        ? new Date(form.published_at).toISOString()
        : null,
    };

    setSaving(true);

    try {
      let res;

      if (isEdit) {
        res = await api.put(`/posts/${id}`, payload);
      } else {
        res = await api.post("/posts", payload);
      }

      toast.success(
        status === "PUBLISHED"
          ? "Konten dipublikasikan"
          : "Draf disimpan"
      );

      navigate(`/admin/posts/${res.data.id}`, {
        replace: true,
      });

      if (!isEdit) {
        setForm((current) => ({
          ...current,
          ...res.data,
        }));
      }
    } catch (e) {
      toast.error(
        formatApiError(e.response?.data?.detail) ||
          "Gagal menyimpan konten"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!refs) {
    return <Spinner />;
  }

  const isTadabbur = form.type === "TADABBUR";
  const isCahayaHikmah = form.type === "CAHAYA_HIKMAH";

  return (
    <div className="ck-fade-up">
      {/* HEADER */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      <PageHeader
        label={isEdit ? "Sunting Konten" : "Konten Baru"}
        title={
          isTadabbur
            ? "Editor Tadabbur"
            : isCahayaHikmah
              ? "Editor Cahaya Hikmah"
              : "Editor Konten"
        }
        action={
          <div className="flex gap-2">
            <Btn
              variant="outline"
              onClick={() => submit("DRAFT")}
              disabled={saving}
              data-testid="btn-save-draft"
            >
              <Save className="w-4 h-4" />
              Simpan Draf
            </Btn>

            <Btn
              variant="gold"
              onClick={() => submit("PUBLISHED")}
              disabled={saving}
              data-testid="btn-publish-post"
            >
              <Send className="w-4 h-4" />
              Publikasikan
            </Btn>
          </div>
        }
      />

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-5">

          {/* INFORMASI UTAMA */}
          <div className="ck-card p-6 space-y-4">
            <div className="ck-label">
              Informasi Utama
            </div>

            <Field label="Tipe Konten">
              <select
                className="ck-input"
                value={form.type}
                data-testid="editor-select-type"
                onChange={(e) =>
                  set("type", e.target.value)
                }
                disabled={isEdit}
              >
                <option value="ARTICLE">
                  Artikel
                </option>

                <option value="TADABBUR">
                  Tadabbur
                </option>

                <option value="CAHAYA_HIKMAH">
                  Cahaya Hikmah
                </option>
              </select>
            </Field>

            <Field label="Judul" required>
              <input
                className="ck-input"
                value={form.title}
                data-testid="editor-input-title"
                onChange={(e) =>
                  onTitle(e.target.value)
                }
                placeholder="Judul konten"
              />
            </Field>

            <Field label="Slug (URL)">
              <input
                className="ck-input font-mono-ck text-sm"
                value={form.slug}
                data-testid="editor-input-slug"
                onChange={(e) => {
                  setSlugTouched(true);
                  set(
                    "slug",
                    slugify(e.target.value)
                  );
                }}
                placeholder="otomatis-dari-judul"
              />
            </Field>

            <Field label="Subjudul / Catatan">
              <input
                className="ck-input"
                value={form.subtitle}
                data-testid="editor-input-subtitle"
                onChange={(e) =>
                  set("subtitle", e.target.value)
                }
              />
            </Field>

            <Field label="Ringkasan (Excerpt)">
              <textarea
                className="ck-input min-h-[70px]"
                value={form.excerpt}
                onChange={(e) =>
                  set("excerpt", e.target.value)
                }
                placeholder="Ringkasan singkat konten..."
              />
            </Field>

            {/* CAHAYA HIKMAH */}
            {isCahayaHikmah && (
              <div className="border border-amber-500/25 rounded-xl p-5 space-y-4 bg-amber-500/5">
                <div className="ck-label">
                  Cahaya Hikmah
                </div>

                <Field
                
                  
                
                  label="URL Video"
                  required
                >
                  <input
                    type="url"
                    className="ck-input"
                    value={form.video_url || ""}
                    onChange={(e) =>
                      set(
                        "video_url",
                        e.target.value
                      )
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />

                  <p className="text-xs text-slate-500 mt-1.5">
                    Masukkan URL video YouTube atau
                    platform video lainnya.
                  </p>
                </Field>
                                <Field label="FOTO-FOTO">
                  <div className="space-y-3">
                    {(form.gallery_images || []).map((image, index) => (
                      <div
                        key={index}
                        className="flex gap-2 items-center"
                      >
                        <input
                          type="url"
                          className="ck-input flex-1"
                          value={image}
                          onChange={(e) => {
                            const images = [...(form.gallery_images || [])];
                            images[index] = e.target.value;
                            set("gallery_images", images);
                          }}
                          placeholder="https://..."
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const images = [...(form.gallery_images || [])];
                            images.splice(index, 1);
                            set("gallery_images", images);
                          }}
                          className="px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        set("gallery_images", [
                          ...(form.gallery_images || []),
                          "",
                        ])
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#C79A3E]/40 text-[#A67C2E] hover:bg-[#C79A3E]/10 font-semibold"
                    >
                      + Tambah Foto
                    </button>

                    <p className="text-xs text-slate-500">
                      Masukkan URL gambar. Kamu dapat menambahkan beberapa
                      foto untuk satu konten Cahaya Hikmah.
                    </p>
                  </div>
                </Field>
              </div>
            )}
          </div>

          {/* TADABBUR */}
          {isTadabbur && (
            <div
              className="ck-card p-6 space-y-4 border-amber-500/25"
              data-testid="section-tadabbur"
            >
              <div className="ck-label">
                Tadabbur Al-Qur&apos;an
              </div>

              <Field
                label="Surah"
                required
              >
                <select
                  className="ck-input"
                  value={form.surah_id}
                  data-testid="tadabbur-surah-name"
                  onChange={(e) =>
                    set(
                      "surah_id",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Pilih Surah
                  </option>

                  {refs.surahs.map((s) => (
                    <option
                      key={s.id}
                      value={s.id}
                    >
                      {s.number}. {s.name} (
                      {s.arabic_name})
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Nomor Ayat"
                  required
                >
                  <input
                    className="ck-input"
                    value={
                      form.ayat_number || ""
                    }
                    data-testid="tadabbur-verse-number"
                    onChange={(e) =>
                      set(
                        "ayat_number",
                        e.target.value
                      )
                    }
                    placeholder="cth. 255 atau 1-5"
                  />
                </Field>

                <Field label="Tema Spiritual">
                  <input
                    className="ck-input"
                    value={form.theme || ""}
                    data-testid="tadabbur-theme-input"
                    onChange={(e) =>
                      set(
                        "theme",
                        e.target.value
                      )
                    }
                    placeholder="cth. Ketauhidan"
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ISI & NASKAH */}
          <div className="ck-card p-6 space-y-3">
            <div className="ck-label">
              Isi &amp; Naskah
            </div>
            <Field
            label="Konten"
            required
>
           <RichTextEditor
           value={form.content}
          onChange={(value) => set("content", value)}
          placeholder="Tulis isi konten di sini..."/>
            </Field>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">

          {/* PUBLIKASI */}
          <div className="ck-card p-6 space-y-4">
            <div className="ck-label">
              Publikasi
            </div>

            <Field label="Status">
              <select
                className="ck-input"
                value={form.status}
                data-testid="editor-select-status"
                onChange={(e) =>
                  set("status", e.target.value)
                }
              >
                <option value="DRAFT">
                  Draf
                </option>

                <option value="PUBLISHED">
                  Dipublikasikan
                </option>

                <option value="ARCHIVED">
                  Diarsipkan
                </option>
              </select>
            </Field>

            <Field label="Tanggal & Waktu Terbit">
              <input
                type="datetime-local"
                className="ck-input"
                value={
                  form.published_at || ""
                }
                onChange={(e) =>
                  set(
                    "published_at",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Penulis">
              <select
                className="ck-input"
                value={form.author_id || ""}
                data-testid="editor-select-author"
                onChange={(e) =>
                  set(
                    "author_id",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Default (Arief Sulistyanto)
                </option>

                {refs.authors.map((a) => (
                  <option
                    key={a.id}
                    value={a.id}
                  >
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* SAMPUL */}
          <div className="ck-card p-6 space-y-3">
            <div className="ck-label">
              Sampul
            </div>

            <MediaPicker
              value={form.cover_image}
              onChange={(value) =>
                set(
                  "cover_image",
                  value
                )
              }
              label="Cover"
            />
          </div>

          <div className="ck-card p-6 space-y-4">
  <div>
    <div className="ck-label">Berkas PDF</div>
    <p className="text-xs text-slate-500 mt-1">
      Lampirkan versi PDF artikel jika tersedia.
    </p>
  </div>

  <MediaPicker
    value={form.pdf_file}
    onChange={(v) => set("pdf_file", v)}
    label="PDF"
    accept="pdf"
  />

  <label className="flex items-center justify-between gap-3 cursor-pointer pt-2 border-t border-slate-800">
    <div>
      <div className="text-sm text-slate-300">
        Izinkan Unduh PDF
      </div>
      <div className="text-xs text-slate-500 mt-0.5">
        Member yang memiliki akses dapat mengunduh file.
      </div>
    </div>

    <button
      type="button"
      onClick={() =>
        set("download_enabled", !form.download_enabled)
      }
      data-testid="article-toggle-download"
      className={`relative w-11 h-6 rounded-full transition-colors ${
        form.download_enabled
          ? "bg-emerald-500"
          : "bg-slate-700"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          form.download_enabled
            ? "translate-x-5"
            : ""
        }`}
      />
    </button>
  </label>
</div>

          {/* KATEGORI */}
          <div className="ck-card p-6 space-y-4">
            <div className="ck-label">
              Kategori
            </div>

            <Field label="Kategori Utama">
              <select
                className="ck-input"
                value={form.category_id || ""}
                onChange={(e) =>
                  set(
                    "category_id",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Pilih Kategori
                </option>

                {refs.categories.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Subkategori">
              <select
                className="ck-input"
                value={
                  form.subcategory_id || ""
                }
                onChange={(e) =>
                  set(
                    "subcategory_id",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Pilih Subkategori
                </option>

                {filteredSubs.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* TAG */}
          <div className="ck-card p-6 space-y-3">
            <div className="ck-label">
              Tag
            </div>

            <div className="flex flex-wrap gap-2">
              {refs.tags.map((t) => {
                const on =
                  form.tag_ids.includes(
                    t.id
                  );

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      toggleArr(
                        "tag_ids",
                        t.id
                      )
                    }
                    className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                      on
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                        : "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* KOLEKSI */}
          <div className="ck-card p-6 space-y-3">
            <div className="ck-label">
              Koleksi Seri
            </div>

            <div className="space-y-2">
              {refs.collections.map((c) => {
                const on =
                  form.collection_ids.includes(
                    c.id
                  );

                return (
                  <label
                    key={c.id}
                    className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        toggleArr(
                          "collection_ids",
                          c.id
                        )
                      }
                      className="accent-emerald-500 w-4 h-4"
                    />

                    {c.name}
                  </label>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}