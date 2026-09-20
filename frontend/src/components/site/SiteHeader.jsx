import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Menu, X, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const CMS_ROLES = ["SUPER_ADMIN", "EDITOR", "AUTHOR"];

const NAV = [
  { to: "/", label: "Beranda", end: true },
  { to: "/tadabbur", label: "Tadabbur" },
  { to: "/artikel", label: "Artikel" },
  { to: "/buku", label: "Buku & Risalah" },
  { to: "/koleksi", label: "Koleksi" },
  { to: "/tentang-penulis", label: "Tentang Penulis"},
  { to: "/cahaya-hikmah", label: "Cahaya Hikmah" }
];

export default function SiteHeader() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMember = user && !CMS_ROLES.includes(user.role);
  const isStaff = user && CMS_ROLES.includes(user.role);

  const search = (e) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/cari?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
    }
  };

  const doLogout = () => { logout(); setOpen(false); navigate("/"); };

  return (
    <header className="sticky top-0 z-40 bg-cream border-b border-[#E6DDC8] shadow-sm">
      <div className="w-full max-w-[1700px] mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 h-20">
          <Link to="/" className="flex items-center gap-3 shrink-0" data-testid="site-logo">
            <img src="/logo-cahaya.png" alt="Cahaya Kehidupan" className="h-11 w-11 object-contain" />
            <div className="leading-none">
              <div className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-navy">CAHAYA KEHIDUPAN</div>
              <div className="text-[10px] sm:text-[11px] text-[#8A7B57] italic mt-0.5 hidden sm:block">Kehidupan yang Diterangi Cahaya Tidak Akan Kehilangan Arah</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-5 ml-5">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} data-testid={`nav-${n.label}`}
                className={({ isActive }) => `site-link text-sm font-semibold text-navy/80 hover:text-navy ${isActive ? "active text-navy" : ""}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <form onSubmit={search} className="hidden md:flex items-center ml-auto shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA6B4]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} data-testid="site-search-input"
                placeholder="Cari tulisan, ayat, tema..." className="w-44 xl:w-56 pl-9 pr-3 py-2.5 rounded-full bg-white border border-[#E6DDC8] text-sm text-navy placeholder:text-[#9AA6B4] focus:outline-none focus:ring-2 focus:ring-[#C79A3E]/40 focus:border-[#C79A3E]" />
            </div>
          </form>

          <div className="hidden lg:flex items-center gap-2 ml-2 shrink-0">
            {!user ? (
              <>
                <Link to="/masuk" data-testid="header-login" className="px-4 py-2 rounded-full text-sm font-semibold text-navy border border-[#E6DDC8] hover:border-navy transition-colors">Masuk</Link>
                <Link to="/daftar" data-testid="header-register" className="px-4 py-2 rounded-full text-sm font-semibold bg-[#C79A3E] hover:bg-[#A67C2E] text-white transition-colors shadow-md">Daftar</Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {isStaff && (
                  <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold text-navy border border-[#E6DDC8] hover:border-navy transition-colors" data-testid="header-admin-link">
                    <LayoutDashboard className="w-4 h-4" /> Admin
                  </Link>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy" data-testid="header-user-name">
                  <span className="w-8 h-8 rounded-full bg-navy text-gold flex items-center justify-center text-xs font-bold">{user.name?.[0]?.toUpperCase()}</span>
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </span>
                <button onClick={doLogout} data-testid="header-logout" title="Keluar" className="p-2 rounded-full text-[#6B7C90] hover:text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button className="lg:hidden ml-auto text-navy p-2" onClick={() => setOpen((o) => !o)} data-testid="site-mobile-toggle">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#E6DDC8] bg-cream" data-testid="site-mobile-menu">
          <div className="px-4 py-4 space-y-1">
            <form onSubmit={search} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA6B4]" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari tulisan, ayat, tema..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white border border-[#E6DDC8] text-sm focus:outline-none" />
              </div>
            </form>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
                className={({ isActive }) => `block px-3 py-2.5 rounded-lg text-sm font-semibold ${isActive ? "bg-softblue text-navy" : "text-navy/80"}`}>
                {n.label}
              </NavLink>
            ))}

            <div className="pt-3 mt-2 border-t border-[#E6DDC8]">
              {!user ? (
                <div className="flex gap-2">
                  <Link to="/masuk" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-full text-sm font-semibold text-navy border border-[#E6DDC8]">Masuk</Link>
                  <Link to="/daftar" onClick={() => setOpen(false)} className="flex-1 text-center px-4 py-2.5 rounded-full text-sm font-semibold bg-[#C79A3E] hover:bg-[#A67C2E] text-white shadow-md transition-colors">Daftar</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 text-sm font-semibold text-navy">
                    <UserIcon className="w-4 h-4" /> {user.name}
                  </div>
                  {isStaff && <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-navy bg-softblue">Panel Admin</Link>}
                  <button onClick={doLogout} className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500">Keluar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
