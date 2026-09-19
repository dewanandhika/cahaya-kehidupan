import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "@/components/AdminLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import PostsList from "@/pages/PostsList";
import PostEditor from "@/pages/PostEditor";
import BooksList from "@/pages/BooksList";
import WorkEditor from "@/pages/WorkEditor";
import RisalahList from "@/pages/RisalahList";
import MediaLibrary from "@/pages/MediaLibrary";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import Taxonomy from "@/pages/Taxonomy";
import { Loader2 } from "lucide-react";

import SiteLayout from "@/components/site/SiteLayout";
import Home from "@/pages/site/Home";
import TadabburPage from "@/pages/site/Tadabbur";
import TadabburSurah from "@/pages/site/TadabburSurah";
import Artikel from "@/pages/site/Artikel";
import PostDetail from "@/pages/site/PostDetail";
import Library from "@/pages/site/Library";
import WorkDetail from "@/pages/site/WorkDetail";
import Koleksi from "@/pages/site/Koleksi";
import KoleksiDetail from "@/pages/site/KoleksiDetail";
import Tentang from "@/pages/site/Tentang";
import Cari from "@/pages/site/Cari";
import MemberAuth from "@/pages/site/MemberAuth";
import CahayaHikmah from "@/pages/site/CahayaHikmah";

const CMS_ROLES = ["SUPER_ADMIN", "EDITOR", "AUTHOR"];

function Protected({ children }) {
  const { user } = useAuth();
  if (user === null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17]">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (!CMS_ROLES.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC SITE */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tadabbur" element={<TadabburPage />} />
          <Route path="/tadabbur/:surah" element={<TadabburSurah />} />
          <Route path="/tadabbur/:surah/:slug" element={<PostDetail />} />
          <Route path="/artikel" element={<Artikel />} />
          <Route path="/artikel/:category/:slug" element={<PostDetail />} />
          <Route path="/buku" element={<Library defaultTab="buku" />} />
          <Route path="/buku/:slug" element={<WorkDetail kind="buku" />} />
          <Route path="/risalah" element={<Library defaultTab="risalah" />} />
          <Route path="/risalah/:slug" element={<WorkDetail kind="risalah" />} />
          <Route path="/koleksi" element={<Koleksi />} />
          <Route path="/koleksi/:slug" element={<KoleksiDetail />} />
          <Route path="/tentang-penulis" element={<Tentang />} />
          <Route path="/cari" element={<Cari />} />
          <Route path="/cahaya-hikmah" element={<CahayaHikmah />} />
        </Route>

        {/* MEMBER AUTH (public) */}
        <Route path="/masuk" element={<MemberAuth mode="login" />} />
        <Route path="/daftar" element={<MemberAuth mode="register" />} />

        {/* ADMIN */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <Protected>
              <AdminLayout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="posts" element={<PostsList mode="all" />} />
          <Route path="articles" element={<PostsList mode="ARTICLE" />} />
          <Route path="tadabbur" element={<PostsList mode="TADABBUR" />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/:id" element={<PostEditor />} />
          <Route path="books" element={<BooksList />} />
          <Route path="books/new" element={<WorkEditor kind="books" />} />
          <Route path="books/:id" element={<WorkEditor kind="books" />} />
          <Route path="risalah" element={<RisalahList />} />
          <Route path="risalah/new" element={<WorkEditor kind="risalahs" />} />
          <Route path="risalah/:id" element={<WorkEditor kind="risalahs" />} />
          <Route path="taxonomy/:type" element={<Taxonomy />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
