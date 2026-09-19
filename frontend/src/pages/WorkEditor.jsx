import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { PageHeader, Btn, Field, Spinner } from "@/components/ck";
import MediaPicker from "@/components/MediaPicker";
import { Save, Send, ArrowLeft } from "lucide-react";

function slugify(t) {
  return (t || "").toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

const META = {
  books: { title: "Buku", route: "books", hasYear: true },
  risalahs: { title: "Risalah", route: "risalah", hasYear: false },
};

const empty = {
  title: "", subtitle: "", author_id: "", cover: "", description: "", year: "",
  content: "", pdf_file: "", download_enabled: false, status: "DRAFT", published_at: "", slug: "",
};

export default function WorkEditor({ kind }) {
  const meta = META[kind];
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [slugTouched, setSlugTouched] = useState(false);
  const [authors, setAuthors] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    api.get("/authors").then((r) => setAuthors(r.data));
    if (isEdit) {
      api.get(`/${kind}`).then((r) => {
        const item = r.data.find((x) => x.id === id);
        if (!item) { toast.error("Data tidak ditemukan"); navigate(`/admin/${meta.route}`); return; }
        setForm({ ...empty, ...item, published_at: item.published_at ? item.published_at.slice(0, 16) : "" });
        setSlugTouched(true);
      });
    }
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const onTitle = (v) => setForm((f) => ({ ...f, title: v, slug: slugTouched ? f.slug : slugify(v) }));

  const submit = async (status) => {
    const payload = { ...form, status, published_at: form.published_at ? new Date(form.published_at).toISOString() : null };
    setSaving(true);
    try {
      let res;
      if (isEdit) res = await api.put(`/${kind}/${id}`, payload);
      else res = await api.post(`/${kind}`, payload);
      toast.success(status === "PUBLISHED" ? `${meta.title} dipublikasikan` : "Draf disimpan");
      navigate(`/admin/${meta.route}/${res.data.id}`, { replace: true });
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  if (!authors) return <Spinner />;

  return (
    <div className="ck-fade-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-4">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>
      <PageHeader
        label={isEdit ? `Sunting ${meta.title}` : `${meta.title} Baru`}
        title={`Editor ${meta.title}`}
        action={
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => submit("DRAFT")} disabled={saving} data-testid="btn-save-draft">
              <Save className="w-4 h-4" /> Simpan Draf
            </Btn>
            <Btn variant="gold" onClick={() => submit("PUBLISHED")} disabled={saving} data-testid="btn-publish-work">
              <Send className="w-4 h-4" /> Publikasikan
            </Btn>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="ck-card p-6 space-y-4">
            <div className="ck-label">Informasi {meta.title}</div>
            <Field label="Judul" required>
              <input className="ck-input" value={form.title} data-testid="work-input-title" onChange={(e) => onTitle(e.target.value)} />
            </Field>
            <Field label="Slug (URL)">
              <input className="ck-input font-mono-ck text-sm" value={form.slug} data-testid="work-input-slug"
                onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
            </Field>
            <Field label="Subjudul">
              <input className="ck-input" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </Field>
            <Field label="Deskripsi">
              <textarea className="ck-input min-h-[90px]" value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>

          <div className="ck-card p-6 space-y-3">
            <div className="ck-label">Isi / Naskah</div>
            <Field label="Konten">
              <textarea className="ck-input min-h-[260px] font-serif-ck text-base leading-relaxed" value={form.content} data-testid="work-textarea-content" onChange={(e) => set("content", e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="space-y-5">
          <div className="ck-card p-6 space-y-4">
            <div className="ck-label">Publikasi</div>
            <Field label="Status">
              <select className="ck-input" value={form.status} data-testid="work-select-status" onChange={(e) => set("status", e.target.value)}>
                <option value="DRAFT">Draf</option>
                <option value="PUBLISHED">Dipublikasikan</option>
                <option value="ARCHIVED">Diarsipkan</option>
              </select>
            </Field>
            <Field label="Penulis" required>
              <select className="ck-input" value={form.author_id || ""} data-testid="work-select-author" onChange={(e) => set("author_id", e.target.value)}>
                <option value="">Default (Arief Sulistyanto)</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            {meta.hasYear && (
              <Field label="Tahun Terbit">
                <input className="ck-input" value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="cth. 2024" />
              </Field>
            )}
            <Field label="Tanggal Terbit">
              <input type="datetime-local" className="ck-input" value={form.published_at || ""} onChange={(e) => set("published_at", e.target.value)} />
            </Field>
          </div>

          <div className="ck-card p-6 space-y-3">
            <div className="ck-label">Sampul</div>
            <MediaPicker value={form.cover} onChange={(v) => set("cover", v)} label="Cover" />
          </div>

          <div className="ck-card p-6 space-y-4">
            <div className="ck-label">Berkas PDF</div>
            <MediaPicker value={form.pdf_file} onChange={(v) => set("pdf_file", v)} label="PDF" accept="all" />
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm text-slate-300">Izinkan Unduh PDF</span>
              <button type="button" onClick={() => set("download_enabled", !form.download_enabled)} data-testid="work-toggle-download"
                className={`relative w-11 h-6 rounded-full transition-colors ${form.download_enabled ? "bg-emerald-500" : "bg-slate-700"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${form.download_enabled ? "translate-x-5" : ""}`} />
              </button>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
