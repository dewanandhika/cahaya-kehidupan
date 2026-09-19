import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import api, { formatApiError, mediaUrl } from "@/lib/api";
import { PageHeader, Btn, Spinner, Empty, Modal } from "@/components/ck";
import { Upload, Trash2, FileText, Film, Music, Search, Loader2, Copy, X } from "lucide-react";

const FILTERS = [
  ["", "Semua"], ["image", "Gambar"], ["application/pdf", "Dokumen"], ["video", "Video"], ["audio", "Audio"],
];

function icon(type) {
  if ((type || "").startsWith("image")) return null;
  if ((type || "").startsWith("video")) return Film;
  if ((type || "").startsWith("audio")) return Music;
  return FileText;
}

export default function MediaLibrary() {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [del, setDel] = useState(null);
  const inputRef = useRef();

  const load = () => api.get("/media").then((r) => setItems(r.data)).catch(() => setItems([]));
  useEffect(() => { load(); }, []);

  const upload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        await api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      } catch (e) { toast.error(`${file.name}: ${formatApiError(e.response?.data?.detail)}`); }
    }
    toast.success("Unggah selesai");
    setUploading(false);
    load();
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/media/${del.id}`);
      toast.success("Media dihapus");
      setDel(null);
      setPreview(null);
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const copyLink = (m) => {
    navigator.clipboard?.writeText(mediaUrl(m.url));
    toast.success("Tautan disalin");
  };

  const filtered = (items || []).filter((m) => {
    const okType = !filter || (m.type || "").startsWith(filter);
    const okSearch = !search || (m.filename || "").toLowerCase().includes(search.toLowerCase());
    return okType && okSearch;
  });

  return (
    <div className="ck-fade-up" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload(Array.from(e.dataTransfer.files)); }}>
      <PageHeader
        label="Aset"
        title="Pustaka Media"
        subtitle="Kelola dan gunakan kembali gambar, dokumen, audio, serta video."
        action={
          <Btn variant="gold" onClick={() => inputRef.current?.click()} data-testid="btn-upload-media" disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Unggah Media
          </Btn>
        }
      />
      <input ref={inputRef} type="file" multiple className="hidden" data-testid="media-file-input"
        accept=".jpg,.jpeg,.png,.webp,.pdf,.mp4,.mp3" onChange={(e) => upload(Array.from(e.target.files))} />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} data-testid={`filter-${v || "all"}`}
              className={`px-3.5 py-2 rounded-lg text-sm border transition-all ${filter === v ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-900/40 text-slate-400 border-slate-700 hover:border-slate-500"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input className="ck-input pl-10" placeholder="Cari nama file..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {items === null ? <Spinner /> : filtered.length === 0 ? (
        <div className="ck-card border-dashed"><Empty text="Belum ada media. Seret & lepas file di sini atau klik Unggah Media." /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" data-testid="grid-media-items">
          {filtered.map((m) => {
            const Ico = icon(m.type);
            return (
              <button key={m.id} onClick={() => setPreview(m)} data-testid={`media-item-${m.id}`}
                className="ck-card overflow-hidden group hover:border-amber-500/40 transition-all text-left">
                <div className="aspect-square bg-[#0D1420] flex items-center justify-center overflow-hidden">
                  {Ico ? <Ico className="w-8 h-8 text-slate-500" /> : <img src={mediaUrl(m.url)} alt={m.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                </div>
                <div className="px-2.5 py-2">
                  <div className="text-xs text-slate-300 truncate">{m.filename}</div>
                  <div className="text-[10px] text-slate-500 font-mono-ck mt-0.5">{(m.size / 1024).toFixed(0)} KB</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal open={!!preview} onClose={() => setPreview(null)} title="Detail Media" testid="modal-media-preview"
        footer={
          <>
            <Btn variant="outline" onClick={() => copyLink(preview)}><Copy className="w-4 h-4" /> Salin Tautan</Btn>
            <Btn variant="danger" onClick={() => setDel(preview)} data-testid="btn-delete-media"><Trash2 className="w-4 h-4" /> Hapus</Btn>
          </>
        }>
        {preview && (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-[#0D1420] flex items-center justify-center max-h-72">
              {(preview.type || "").startsWith("image")
                ? <img src={mediaUrl(preview.url)} alt={preview.filename} className="max-h-72 object-contain" />
                : <div className="py-12 text-slate-500 flex flex-col items-center gap-2"><FileText className="w-10 h-10" /><span className="text-sm">{preview.filename}</span></div>}
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Nama" value={preview.filename} />
              <Row label="Tipe" value={preview.type} />
              <Row label="Ukuran" value={`${(preview.size / 1024).toFixed(1)} KB`} />
              <Row label="Diunggah oleh" value={preview.uploaded_by_name || "—"} />
              <Row label="Tautan" value={preview.url} mono />
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="Hapus Media" testid="modal-delete-media"
        footer={<><Btn variant="ghost" onClick={() => setDel(null)}>Batal</Btn><Btn variant="danger" onClick={confirmDelete} data-testid="btn-confirm-delete">Hapus</Btn></>}>
        <p className="text-sm text-slate-300">Yakin ingin menghapus <span className="text-amber-400">"{del?.filename}"</span>?</p>
      </Modal>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex gap-3">
      <span className="text-slate-500 w-28 shrink-0">{label}</span>
      <span className={`text-slate-200 break-all ${mono ? "font-mono-ck text-xs" : ""}`}>{value}</span>
    </div>
  );
}
