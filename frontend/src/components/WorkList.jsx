import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api, { formatApiError, mediaUrl } from "@/lib/api";
import { PageHeader, Btn, StatusBadge, Spinner, Empty, Modal } from "@/components/ck";
import { Plus, Pencil, Trash2, BookMarked, Download } from "lucide-react";

export default function WorkList({ kind, meta }) {
  const [items, setItems] = useState(null);
  const [del, setDel] = useState(null);
  const navigate = useNavigate();

  const load = () => api.get(`/${kind}`).then((r) => setItems(r.data)).catch(() => setItems([]));
  useEffect(() => { load(); }, [kind]);

  const confirmDelete = async () => {
    try {
      await api.delete(`/${kind}/${del.id}`);
      toast.success(`${meta.singular} dihapus`);
      setDel(null);
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  return (
    <div className="ck-fade-up">
      <PageHeader
        label="Manajemen Konten"
        title={meta.title}
        subtitle={meta.sub}
        action={
          <Btn variant="gold" data-testid={`btn-new-${kind}`} onClick={() => navigate(`/admin/${meta.route}/new`)}>
            <Plus className="w-4 h-4" /> Tambah {meta.singular}
          </Btn>
        }
      />
      {items === null ? <Spinner /> : items.length === 0 ? (
        <div className="ck-card"><Empty text={`Belum ada ${meta.singular.toLowerCase()}.`} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid={`grid-${kind}`}>
          {items.map((b) => (
            <div key={b.id} className="ck-card overflow-hidden group" data-testid={`${kind}-card-${b.id}`}>
              <div className="aspect-[3/2] bg-slate-800 relative overflow-hidden">
                {b.cover ? (
                  <img src={mediaUrl(b.cover)} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <BookMarked className="w-10 h-10 text-slate-600" />
                  </div>
                )}
                <div className="absolute top-2 left-2"><StatusBadge status={b.status} /></div>
                {b.download_enabled && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-1">
                    <Download className="w-3 h-3" /> Unduh
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-serif-ck text-lg font-semibold text-slate-100 leading-snug">{b.title}</h3>
                {b.subtitle && <p className="text-xs text-slate-500 mt-0.5">{b.subtitle}</p>}
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{b.description}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-500">{b.author?.name || "—"}{b.year ? ` · ${b.year}` : ""}</span>
                  <div className="flex gap-1">
                    <button onClick={() => navigate(`/admin/${meta.route}/${b.id}`)} data-testid={`btn-edit-${b.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDel(b)} data-testid={`btn-delete-${b.id}`} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!del} onClose={() => setDel(null)} title={`Hapus ${meta.singular}`} testid="modal-delete-work"
        footer={<><Btn variant="ghost" onClick={() => setDel(null)}>Batal</Btn><Btn variant="danger" onClick={confirmDelete} data-testid="btn-confirm-delete">Hapus</Btn></>}>
        <p className="text-sm text-slate-300">Yakin ingin menghapus <span className="text-amber-400">"{del?.title}"</span>?</p>
      </Modal>
    </div>
  );
}
