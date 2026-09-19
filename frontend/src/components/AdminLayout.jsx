import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { RoleBadge } from "@/components/ck";
import {
  LayoutDashboard, FileText, Newspaper, BookOpen, BookMarked, Scroll,
  FolderTree, GitBranch, Tag, Layers, Book, Image as ImageIcon, Users as UsersIcon,
  Sliders, LogOut, Menu, X, Sparkles,
} from "lucide-react";

const groups = [
  {
    title: "Ringkasan",
    items: [{ to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" }],
  },
  {
    title: "Manajemen Konten",
    items: [
      { to: "/admin/posts", label: "Semua Konten", icon: FileText, testid: "nav-all-posts" },
      { to: "/admin/articles", label: "Artikel", icon: Newspaper, testid: "nav-articles" },
      { to: "/admin/tadabbur", label: "Tadabbur", icon: BookOpen, testid: "nav-tadabbur" },
      { to: "/admin/books", label: "Buku", icon: BookMarked, testid: "nav-books" },
      { to: "/admin/risalah", label: "Risalah", icon: Scroll, testid: "nav-risalah" },
    ],
  },
  {
    title: "Taksonomi & Struktur",
    items: [
      { to: "/admin/taxonomy/categories", label: "Kategori", icon: FolderTree, testid: "nav-categories" },
      { to: "/admin/taxonomy/subcategories", label: "Subkategori", icon: GitBranch, testid: "nav-subcategories" },
      { to: "/admin/taxonomy/tags", label: "Tag", icon: Tag, testid: "nav-tags" },
      { to: "/admin/taxonomy/collections", label: "Koleksi", icon: Layers, testid: "nav-collections" },
      { to: "/admin/taxonomy/surahs", label: "Surah", icon: Book, testid: "nav-surahs" },
    ],
  },
  {
    title: "Aset & Pengguna",
    items: [
      { to: "/admin/media", label: "Pustaka Media", icon: ImageIcon, testid: "nav-media" },
      { to: "/admin/users", label: "Pengguna & Peran", icon: UsersIcon, testid: "nav-users", roles: ["SUPER_ADMIN"] },
      { to: "/admin/settings", label: "Pengaturan", icon: Sliders, testid: "nav-settings", roles: ["SUPER_ADMIN"] },
    ],
  },
];

export default function AdminLayout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarInner = (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-slate-800/80">
  <div className="flex items-center gap-3">
    <div className="w-11 h-11 rounded-lg bg-white/95 flex items-center justify-center shadow-lg shadow-amber-900/40 p-1">
      <img
        src="/logo-cahaya.png"
        alt="Cahaya Kehidupan"
        className="w-full h-full object-contain"
      />
    </div>

    <div className="min-w-0">
      <div className="font-serif-ck text-lg font-bold leading-none text-slate-50">
        Cahaya Kehidupan
      </div>
      <div className="ck-label mt-1">
        Admin CMS
      </div>
    </div>
  </div>
</div>

      <nav className="flex-1 overflow-y-auto ck-scroll px-3 py-4 space-y-6">
        {groups.map((g) => {
          const items = g.items.filter((it) => !it.roles || it.roles.includes(user?.role));
          if (!items.length) return null;
          return (
            <div key={g.title}>
              <div className="px-3 mb-2 ck-label !text-slate-500">{g.title}</div>
              <div className="space-y-0.5">
                {items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    data-testid={it.testid}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent"
                      }`
                    }
                  >
                    <it.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{it.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/80 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-200 truncate">{user?.name}</div>
            <div className="mt-0.5"><RoleBadge role={user?.role} /></div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          data-testid="btn-logout"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] ck-grain">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-[#0D1420] border-r border-slate-800/80 z-30">
        {SidebarInner}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-[#0D1420] border-r border-slate-800 z-50">
            {SidebarInner}
          </aside>
        </div>
      )}

      {/* Mobile topbar */}
      <div className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0D1420]/95 backdrop-blur border-b border-slate-800">
        <button onClick={() => setOpen(true)} data-testid="btn-open-sidebar" className="text-slate-300">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-serif-ck font-bold text-slate-100">Cahaya Kehidupan</span>
        <div className="w-6" />
      </div>

      <main className="lg:pl-64 relative z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
