import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { PageHeader, Btn, Field, Spinner, Empty, Modal, StatusBadge } from "@/components/ck";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const CONFIGS = {
  categories: {
    endpoint: "categories", title: "Kategori", singular: "Kategori",
    sub: "Kelola kategori konten. Kategori bersifat dinamis dan dapat ditambah kapan saja.",
    fields: [
      { name: "name", label: "Nama Kategori", type: "text", required: true },
      { name: "description", label: "Deskripsi", type: "textarea" },
    ],
    columns: [{ key: "name", label: "Nama" }, { key: "slug", label: "Slug", mono: true }, { key: "description", label: "Deskripsi" }],
  },
  subcategories: {
    endpoint: "subcategories", title: "Subkategori", singular: "Subkategori",
    sub: "Kelola subkategori dan kaitkan dengan kategori induk.",
    fields: [
      { name: "name", label: "Nama Subkategori", type: "text", required: true },
      { name: "category_id", label: "Kategori Induk", type: "ref", ref: "categories" },
      { name: "description", label: "Deskripsi", type: "textarea" },
    ],
    columns: [{ key: "name", label: "Nama" }, { key: "category", label: "Kategori", render: (r) => r.category?.name || "—" }, { key: "slug", label: "Slug", mono: true }],
  },
  tags: {
    endpoint: "tags", title: "Tag", singular: "Tag",
    sub: "Kelola tag untuk mengelompokkan konten lintas kategori.",
    fields: [{ name: "name", label: "Nama Tag", type: "text", required: true }],
    columns: [{ key: "name", label: "Nama" }, { key: "slug", label: "Slug", mono: true }],
  },
  collections: {
    endpoint: "collections", title: "Koleksi", singular: "Koleksi",
    sub: "Kelola koleksi seri. Satu konten dapat masuk ke banyak koleksi.",
    fields: [
      { name: "name", label: "Nama Koleksi", type: "text", required: true },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "status", label: "Status", type: "select", options: [["PUBLISHED", "Dipublikasikan"], ["DRAFT", "Draf"], ["ARCHIVED", "Diarsipkan"]] },
    ],
    columns: [{ key: "name", label: "Nama" }, { key: "post_count", label: "Jumlah Konten", render: (r) => `${r.post_count || 0} konten` }, { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> }],
  },
  surahs: {
    endpoint: "surahs", title: "Surah", singular: "Surah",
    sub: "Master data surah Al-Qur'an untuk relasi konten Tadabbur.",
    fields: [
      { name: "number", label: "Nomor Surah", type: "number", required: true },
      { name: "name", label: "Nama Surah", type: "text", required: true },
      { name: "arabic_name", label: "Nama Arab", type: "text" },
      { name: "total_ayah", label: "Total Ayat", type: "number", required: true },
    ],
    columns: [
      { key: "number", label: "No", render: (r) => <span className="font-mono-ck">{r.number}</span> },
      { key: "name", label: "Nama" },
      { key: "arabic_name", label: "Arab", render: (r) => <span className="font-arabic text-lg">{r.arabic_name}</span> },
      { key: "total_ayah", label: "Total Ayat" },
    ],
  },
};

export default function Taxonomy() {
  const { type } = useParams();
  const cfg = CONFIGS[type];
  const [items, setItems] = useState(null);
  const [refs, setRefs] = useState({});
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // {mode, data}
  const [del, setDel] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get(`/${cfg.endpoint}`).then((r) => setItems(r.data)).catch(() => setItems([]));

  useEffect(() => {
    setItems(null);
    setSearch("");
    load();
    const refFields = cfg.fields.filter((f) => f.type === "ref");
    Promise.all(refFields.map((f) => api.get(`/${f.ref}`))).then((results) => {
      const map = {};
      refFields.forEach((f, i) => (map[f.ref] = results[i].data));
      setRefs(map);
    });
  }, [type]);

  const emptyForm = useMemo(() => {
    const o = {};
    cfg.fields.forEach((f) => (o[f.name] = f.type === "select" ? f.options[0][0] : f.type === "number" ? "" : ""));
    return o;
  }, [type]);

  const openCreate = () => setModal({ mode: "create", data: { ...emptyForm } });
  const openEdit = (row) => {
    const d = {};
    cfg.fields.forEach((f) => (d[f.name] = row[f.name] ?? ""));
    setModal({ mode: "edit", data: d, id: row.id });
  };

  const save = async () => {
    const payload = { ...modal.data };
    cfg.fields.forEach((f) => { if (f.type === "number") payload[f.name] = payload[f.name] === "" ? 0 : Number(payload[f.name]); });
    setSaving(true);
    try {
      if (modal.mode === "create") await api.post(`/${cfg.endpoint}`, payload);
      else await api.put(`/${cfg.endpoint}/${modal.id}`, payload);
      toast.success(`${cfg.singular} disimpan`);
      setModal(null);
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/${cfg.endpoint}/${del.id}`);
      toast.success(`${cfg.singular} dihapus`);
      setDel(null);
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const filtered = (items || []).filter((r) => !search || (r.name || "").toLowerCase().includes(search.toLowerCase()));

  const testidBtn = { categories: "btn-add-category", subcategories: "btn-add-subcategory", tags: "btn-add-tag", collections: "btn-add-collection", surahs: "btn-add-surah" }[type];

  return (
    <div className="ck-fade-up">
      <PageHeader
        label="Taksonomi & Struktur"
        title={cfg.title}
        subtitle={cfg.sub}
        action={<Btn variant="gold" onClick={openCreate} data-testid={testidBtn}><Plus className="w-4 h-4" /> Tambah {cfg.singular}</Btn>}
      />

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input className="ck-input pl-10" placeholder={`Cari ${cfg.singular.toLowerCase()}...`} value={search} data-testid="input-search-taxonomy" onChange={(e) => setSearch(e.target.value)} />
      </div>

      {items === null ? <Spinner /> : filtered.length === 0 ? (
        <div className="ck-card"><Empty text={`Belum ada ${cfg.singular.toLowerCase()}.`} /></div>
      ) : (
        <div className="ck-card overflow-hidden" data-testid={`table-${type}`}>
          <div className="overflow-x-auto ck-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono-ck uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  {cfg.columns.map((c) => <th key={c.key} className="px-5 py-3 font-medium">{c.label}</th>)}
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors" data-testid={`row-${row.id}`}>
                    {cfg.columns.map((c) => (
                      <td key={c.key} className={`px-5 py-3.5 ${c.mono ? "font-mono-ck text-xs text-slate-500" : "text-slate-200"}`}>
                        {c.render ? c.render(row) : (row[c.key] ?? "—")}
                      </td>
                    ))}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(row)} data-testid={`btn-edit-${row.id}`} className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDel(row)} data-testid={`btn-delete-${row.id}`} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={`${modal?.mode === "edit" ? "Sunting" : "Tambah"} ${cfg.title}`} testid="modal-taxonomy"
        footer={<><Btn variant="ghost" onClick={() => setModal(null)}>Batal</Btn><Btn variant="gold" onClick={save} disabled={saving} data-testid="btn-save-taxonomy">Simpan</Btn></>}>
        {modal && (
          <div className="space-y-4">
            {cfg.fields.map((f) => (
              <Field key={f.name} label={f.label} required={f.required}>
                {f.type === "textarea" ? (
                  <textarea className="ck-input min-h-[80px]" value={modal.data[f.name]} data-testid={`field-${f.name}`} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, [f.name]: e.target.value } }))} />
                ) : f.type === "select" ? (
                  <select className="ck-input" value={modal.data[f.name]} data-testid={`field-${f.name}`} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, [f.name]: e.target.value } }))}>
                    {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                ) : f.type === "ref" ? (
                  <select className="ck-input" value={modal.data[f.name]} data-testid={`field-${f.name}`} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, [f.name]: e.target.value } }))}>
                    <option value="">— Pilih —</option>
                    {(refs[f.ref] || []).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                ) : (
                  <input type={f.type === "number" ? "number" : "text"} className="ck-input" value={modal.data[f.name]} data-testid={`field-${f.name}`} onChange={(e) => setModal((m) => ({ ...m, data: { ...m.data, [f.name]: e.target.value } }))} />
                )}
              </Field>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title={`Hapus ${cfg.singular}`} testid="modal-delete-taxonomy"
        footer={<><Btn variant="ghost" onClick={() => setDel(null)}>Batal</Btn><Btn variant="danger" onClick={confirmDelete} data-testid="btn-confirm-delete">Hapus</Btn></>}>
        <p className="text-sm text-slate-300">Yakin ingin menghapus <span className="text-amber-400">"{del?.name}"</span>?</p>
      </Modal>
    </div>
  );
}
