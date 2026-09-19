import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import {
  PageHeader,
  Btn,
  StatusBadge,
  TypeBadge,
  Spinner,
  Empty,
  Modal,
} from "@/components/ck";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";

const titleMap = {
  all: {
    label: "Manajemen Konten",
    title: "Semua Konten",
    sub: "Kelola seluruh artikel, tadabbur, dan Cahaya Hikmah dalam satu tempat.",
  },

  ARTICLE: {
    label: "Manajemen Konten",
    title: "Artikel",
    sub: "Kumpulan artikel pemikiran, refleksi, dan gagasan.",
  },

  TADABBUR: {
    label: "Manajemen Konten",
    title: "Tadabbur",
    sub: "Renungan dan tadabbur ayat Al-Qur'an.",
  },

  CAHAYA_HIKMAH: {
    label: "Manajemen Konten",
    title: "Cahaya Hikmah",
    sub: "Kumpulan video Cahaya Hikmah.",
  },
};

export default function PostsList({ mode }) {
  const [posts, setPosts] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [del, setDel] = useState(null);

  const navigate = useNavigate();

  const cfg = titleMap[mode] || titleMap.all;

  const load = useCallback(() => {
    const params = {};

    if (mode && mode !== "all") {
      params.type = mode;
    }

    if (statusFilter) {
      params.status = statusFilter;
    }

    if (search) {
      params.search = search;
    }

    api
      .get("/posts", { params })
      .then((r) => {
        setPosts(r.data);
      })
      .catch(() => {
        setPosts([]);
      });
  }, [mode, statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(load, 250);

    return () => clearTimeout(timer);
  }, [load]);

  const confirmDelete = async () => {
    try {
      await api.delete(`/posts/${del.id}`);

      toast.success("Konten dihapus");

      setDel(null);

      load();
    } catch (e) {
      toast.error(
        formatApiError(e.response?.data?.detail)
      );
    }
  };

  const createUrl =
    mode === "all"
      ? "/admin/posts/new"
      : `/admin/posts/new?type=${mode}`;

  const getCreateLabel = () => {
    if (mode === "TADABBUR") {
      return "Tadabbur";
    }

    if (mode === "ARTICLE") {
      return "Artikel";
    }

    if (mode === "CAHAYA_HIKMAH") {
      return "Cahaya Hikmah";
    }

    return "Konten";
  };

  return (
    <div className="ck-fade-up">

      {/* HEADER */}
      <PageHeader
        label={cfg.label}
        title={cfg.title}
        subtitle={cfg.sub}
        action={
          <Btn
            variant="gold"
            data-testid="btn-new-post"
            onClick={() => navigate(createUrl)}
          >
            <Plus className="w-4 h-4" />
            Tambah {getCreateLabel()}
          </Btn>
        }
      />

      {/* SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

          <input
            className="ck-input pl-10"
            placeholder="Cari judul konten..."
            value={search}
            data-testid="input-search-posts"
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          className="ck-input sm:w-52"
          value={statusFilter}
          data-testid="select-status-filter"
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="">
            Semua Status
          </option>

          <option value="PUBLISHED">
            Dipublikasikan
          </option>

          <option value="DRAFT">
            Draf
          </option>

          <option value="ARCHIVED">
            Diarsipkan
          </option>
        </select>

      </div>

      {/* CONTENT */}
      {posts === null ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <div className="ck-card">
          <Empty
            text={
              mode === "CAHAYA_HIKMAH"
                ? "Belum ada video Cahaya Hikmah. Klik tombol tambah untuk membuat."
                : "Belum ada konten. Klik tombol tambah untuk membuat."
            }
          />
        </div>
      ) : (
        <div
          className="ck-card overflow-hidden"
          data-testid="table-posts"
        >
          <div className="overflow-x-auto ck-scroll">

            <table className="w-full text-sm">

              <thead>
                <tr className="text-left text-xs font-mono-ck uppercase tracking-wider text-slate-500 border-b border-slate-800">

                  <th className="px-5 py-3 font-medium">
                    Judul
                  </th>

                  <th className="px-5 py-3 font-medium hidden md:table-cell">
                    Tipe
                  </th>

                  <th className="px-5 py-3 font-medium hidden lg:table-cell">
                    Penulis
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 font-medium text-right">
                    Aksi
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/70">

                {posts.map((p) => (

                  <tr
                    key={p.id}
                    className="hover:bg-slate-800/30 transition-colors"
                    data-testid={`post-row-${p.id}`}
                  >

                    {/* TITLE */}
                    <td className="px-5 py-3.5">

                      <div className="font-medium text-slate-100">
                        {p.title}
                      </div>

                      <div className="text-xs text-slate-500 font-mono-ck mt-0.5">
                        /{p.slug}
                      </div>

                    </td>

                    {/* TYPE */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <TypeBadge type={p.type} />
                    </td>

                    {/* AUTHOR */}
                    <td className="px-5 py-3.5 hidden lg:table-cell text-slate-400">
                      {p.author?.name || "—"}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-3.5">

                      <div className="flex items-center justify-end gap-1">

                        <button
                          onClick={() =>
                            navigate(
                              `/admin/posts/${p.id}`
                            )
                          }
                          data-testid={`btn-edit-${p.id}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-all"
                          title="Edit konten"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() =>
                            setDel(p)
                          }
                          data-testid={`btn-delete-${p.id}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                          title="Hapus konten"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      <Modal
        open={!!del}
        onClose={() => setDel(null)}
        title="Hapus Konten"
        testid="modal-delete-post"
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => setDel(null)}
            >
              Batal
            </Btn>

            <Btn
              variant="danger"
              onClick={confirmDelete}
              data-testid="btn-confirm-delete"
            >
              Hapus
            </Btn>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Yakin ingin menghapus{" "}
          <span className="text-amber-400 font-medium">
            "{del?.title}"
          </span>
          ? Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>

    </div>
  );
}