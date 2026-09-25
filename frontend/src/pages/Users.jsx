import { useEffect, useState } from "react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PageHeader, Btn, Field, Spinner, Empty, Modal, RoleBadge } from "@/components/ck";
import { Plus, Pencil, Trash2, ShieldCheck, Users as UsersIcon } from "lucide-react";

const ROLES = [
  ["SUPER_ADMIN", "Super Admin"],
  ["EDITOR", "Editor"],
  ["AUTHOR", "Author"],
  ["MEMBER", "Member"],
];

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState(null);
  const [roles, setRoles] = useState([]);
  const [modal, setModal] = useState(null);
  const [del, setDel] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/users").then((r) => setUsers(r.data)).catch(() => setUsers([]));
  useEffect(() => {
    load();
    api.get("/roles").then((r) => setRoles(r.data));
  }, []);

  const openCreate = () => setModal({ mode: "create", data: { name: "", email: "", password: "", role: "AUTHOR" } });
  const openEdit = (u) => setModal({ mode: "edit", id: u.id, data: { name: u.name, email: u.email, password: "", role: u.role } });

  const save = async () => {
    setSaving(true);
    try {
      if (modal.mode === "create") await api.post("/users", modal.data);
      else await api.put(`/users/${modal.id}`, modal.data);
      toast.success("Pengguna disimpan");
      setModal(null);
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    finally { setSaving(false); }
  };

const updateMemberStatus = async (u, status) => {
  try {
    await api.put(`/users/${u.id}/status?status=${status}`);

    toast.success(
      status === "APPROVED"
        ? "Member berhasil disetujui"
        : "Member berhasil ditolak"
    );

    load();
  } catch (e) {
    toast.error(formatApiError(e.response?.data?.detail));
  }
};
  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${del.id}`);
      toast.success("Pengguna dihapus");
      setDel(null);
      load();
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
  };

  const upd = (k, v) => setModal((m) => ({ ...m, data: { ...m.data, [k]: v } }));

  return (
    <div className="ck-fade-up">
      <PageHeader
        label="Aset & Pengguna"
        title="Pengguna & Peran"
        subtitle="Kelola akun CMS dan tetapkan peran akses (Super Admin, Editor, Author)."
        action={<Btn variant="gold" onClick={openCreate} data-testid="btn-add-user"><Plus className="w-4 h-4" /> Tambah Pengguna</Btn>}
      />

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {roles.map((r) => (
          <div key={r.role} className="ck-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <RoleBadge role={r.role} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>
          </div>
        ))}
      </div>

      {users === null ? <Spinner /> : users.length === 0 ? (
        <div className="ck-card"><Empty /></div>
      ) : (
        <div className="ck-card overflow-hidden" data-testid="table-users-list">
          <div className="overflow-x-auto ck-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-mono-ck uppercase tracking-wider text-slate-500 border-b border-slate-800">
                  <th className="px-5 py-3 font-medium">Nama</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="px-5 py-3 font-medium">Peran</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors" data-testid={`user-row-${u.id}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-semibold">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-slate-100">{u.name}{u.id === user.id && <span className="text-xs text-slate-500 ml-1">(Anda)</span>}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-slate-400 font-mono-ck text-xs">{u.email}</td>
                    <td className="px-5 py-3.5">
                    <RoleBadge role={u.role} />
                    </td>

                  <td className="px-5 py-3.5">{u.role === "MEMBER" ? (
                <span
         className={
        u.status === "APPROVED"
          ? "text-emerald-400 text-xs font-medium"
          : u.status === "REJECTED"
          ? "text-red-400 text-xs font-medium"
          : "text-amber-400 text-xs font-medium"
      }
    >
      {u.status || "PENDING"}
    </span>
  ) : (
    <span className="text-slate-500 text-xs">—</span>
  )}
</td>

                  <td className="px-5 py-3.5">
  <div className="flex items-center justify-end gap-1">

    {u.role === "MEMBER" && u.status === "PENDING" && (
      <>
        <button
          onClick={() => updateMemberStatus(u, "APPROVED")}
          data-testid={`btn-approve-user-${u.id}`}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20"
        >
          Approve
        </button>

        <button
          onClick={() => updateMemberStatus(u, "REJECTED")}
          data-testid={`btn-reject-user-${u.id}`}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
        >
          Reject
        </button>
      </>
    )}

    <button
      onClick={() => openEdit(u)}
      data-testid={`btn-edit-user-${u.id}`}
      className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800"
    >
      <Pencil className="w-4 h-4" />
    </button>

    {u.id !== user.id && (
      <button
        onClick={() => setDel(u)}
        data-testid={`btn-delete-user-${u.id}`}
        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}

  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "Sunting Pengguna" : "Tambah Pengguna"} testid="modal-user"
        footer={<><Btn variant="ghost" onClick={() => setModal(null)}>Batal</Btn><Btn variant="gold" onClick={save} disabled={saving} data-testid="btn-save-user">Simpan</Btn></>}>
        {modal && (
          <div className="space-y-4">
            <Field label="Nama" required><input className="ck-input" value={modal.data.name} data-testid="user-field-name" onChange={(e) => upd("name", e.target.value)} /></Field>
            <Field label="Email" required><input type="email" className="ck-input" value={modal.data.email} data-testid="user-field-email" onChange={(e) => upd("email", e.target.value)} /></Field>
            <Field label={modal.mode === "edit" ? "Kata Sandi (kosongkan jika tidak diubah)" : "Kata Sandi"} required={modal.mode === "create"}>
              <input type="password" className="ck-input" value={modal.data.password} data-testid="user-field-password" onChange={(e) => upd("password", e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="Peran" required>
              <select className="ck-input" value={modal.data.role} data-testid="user-field-role" onChange={(e) => upd("role", e.target.value)}>
                {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
          </div>
        )}
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="Hapus Pengguna" testid="modal-delete-user"
        footer={<><Btn variant="ghost" onClick={() => setDel(null)}>Batal</Btn><Btn variant="danger" onClick={confirmDelete} data-testid="btn-confirm-delete">Hapus</Btn></>}>
        <p className="text-sm text-slate-300">Yakin ingin menghapus <span className="text-amber-400">"{del?.name}"</span>?</p>
      </Modal>
    </div>
  );
}
