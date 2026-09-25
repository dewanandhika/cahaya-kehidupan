import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { PageHeader, Btn, StatusBadge, TypeBadge, Spinner } from "@/components/ck";
import {
  Files, BookOpen, Newspaper, BookMarked, Scroll, Layers, Users as UsersIcon,
  Plus, FileText, ArrowRight,
} from "lucide-react";

const CARDS = [
  { key: "total_posts", title: "Total Konten", icon: Files, color: "emerald", testid: "stat-card-total-posts" },
  { key: "tadabbur_count", title: "Tadabbur Al-Qur'an", icon: BookOpen, color: "amber", testid: "stat-card-tadabbur" },
  { key: "article_count", title: "Artikel Pemikiran", icon: Newspaper, color: "sky", testid: "stat-card-articles" },
  { key: "book_count", title: "Buku Karya", icon: BookMarked, color: "purple", testid: "stat-card-books" },
  { key: "risalah_count", title: "Risalah & Naskah", icon: Scroll, color: "amber", testid: "stat-card-risalah" },
  { key: "collection_count", title: "Koleksi Seri", icon: Layers, color: "teal", testid: "stat-card-collections" },
  { key: "user_count", title: "Pengguna CMS", icon: UsersIcon, color: "rose", testid: "stat-card-users" },
];

const colorMap = {
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  teal: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data)).catch(() => setStats(false));
  }, []);

  if (!stats) return <Spinner />;

  return (
    <div className="ck-fade-up">
      <PageHeader
        label="Ringkasan Platform"
        title="Dashboard"
        subtitle="Ikhtisar seluruh konten, taksonomi, dan aktivitas terbaru di Cahaya Kehidupan."
        action={
          <Btn variant="gold" data-testid="btn-create-new-post" onClick={() => navigate("/admin/posts/new")}>
            <Plus className="w-4 h-4" /> Konten Baru
          </Btn>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {CARDS.map((c) => (
          <div key={c.key} data-testid={c.testid} className="ck-card p-5 hover:border-slate-700 transition-colors">
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-4 ${colorMap[c.color]}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div className="font-serif-ck text-4xl font-bold text-slate-50">{stats[c.key] ?? 0}</div>
            <div className="text-xs text-slate-300 mt-1">{c.title}</div>
          </div>
        ))}
        <div className="ck-card p-5 flex flex-col justify-between bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex gap-4">
            <div>
              <div className="font-serif-ck text-3xl font-bold text-emerald-400">{stats.published_count}</div>
              <div className="text-xs text-slate-400">Dipublikasikan</div>
            </div>
            <div>
              <div className="font-serif-ck text-3xl font-bold text-amber-400">{stats.draft_count}</div>
              <div className="text-xs text-slate-400">Draf</div>
            </div>
          </div>
          <div className="ck-label mt-4">Status Konten</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
              {stats.pending_member_count > 0 && (
        <div className="ck-card mb-6 border-amber-500/30 bg-amber-500/5">
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif-ck text-lg font-semibold text-slate-100">
                  Persetujuan Member
                </h3>
              </div>

              <p className="text-sm text-slate-400 mt-1">
                Ada {stats.pending_member_count} pendaftaran member yang menunggu persetujuan Owner.
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/users")}
              className="shrink-0 inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Periksa
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6"></div>
      <div className="grid lg:grid-cols-3 gap-6 items-start"></div>
        <div className="lg:col-span-2 lg:col-start-1 ck-card overflow-hidden"data-testid="table-recent-posts">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h3 className="font-serif-ck text-lg font-semibold text-slate-100">Konten Terbaru</h3>
            <button onClick={() => navigate("/admin/posts")} className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              Lihat semua <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-800/70">
            {stats.recent_posts.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/admin/posts/${p.id}`)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-200 truncate">{p.title}</div>
                  <div className="text-xs text-slate-500 truncate">{p.author?.name || "—"}</div>
                </div>
                <TypeBadge type={p.type} />
                <StatusBadge status={p.status} />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 lg:col-start-3 ck-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="font-serif-ck text-lg font-semibold text-slate-100">Draf Dalam Pengerjaan</h3>
          </div>
          <div className="divide-y divide-slate-800/70">
            {stats.draft_posts.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-slate-500">Tidak ada draf.</div>
            )}
            {stats.draft_posts.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/admin/posts/${p.id}`)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/40 transition-colors text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-200 truncate">{p.title}</div>
                  <div className="text-xs text-slate-500">{p.type === "TADABBUR" ? "Tadabbur" : "Artikel"}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
