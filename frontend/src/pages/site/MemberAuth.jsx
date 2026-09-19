import { useState } from "react";
import { Link, useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

const CMS_ROLES = ["SUPER_ADMIN", "EDITOR", "AUTHOR"];

export default function MemberAuth({ mode }) {
  const isRegister = mode === "register";
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const next = sp.get("next") || "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={CMS_ROLES.includes(user.role) ? "/admin/dashboard" : next} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const u = isRegister ? await register(name, email, password) : await login(email, password);
      navigate(CMS_ROLES.includes(u.role) ? "/admin/dashboard" : next, { replace: true });
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md site-fade">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-3">
            <img src="/logo-cahaya.png" alt="Cahaya Kehidupan" className="h-14 w-14 object-contain" />
            <div className="font-display text-2xl font-extrabold text-navy">CAHAYA KEHIDUPAN</div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAE3D3] shadow-xl p-8">
          <div className="gold-rule mb-4" />
          <h1 className="font-display text-3xl font-bold text-navy">{isRegister ? "Daftar Akun" : "Masuk"}</h1>
          <p className="text-sm text-[#6B7C90] mt-2">
            {isRegister ? "Buat akun untuk membaca dan mengunduh buku & risalah." : "Masuk untuk membaca online dan mengunduh buku & risalah."}
          </p>

          {error && (
            <div className="mt-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm" data-testid="member-auth-error">{error}</div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">Nama Lengkap</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required data-testid="member-name-input"
                  className="w-full px-4 py-3 rounded-lg border border-[#E6DDC8] bg-cream/40 focus:outline-none focus:ring-2 focus:ring-[#C79A3E]/40 focus:border-[#C79A3E]" placeholder="Nama Anda" />
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="member-email-input"
                className="w-full px-4 py-3 rounded-lg border border-[#E6DDC8] bg-cream/40 focus:outline-none focus:ring-2 focus:ring-[#C79A3E]/40 focus:border-[#C79A3E]" placeholder="nama@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">Kata Sandi</label>
              <div className="relative">
                <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="member-password-input"
                  className="w-full px-4 py-3 pr-11 rounded-lg border border-[#E6DDC8] bg-cream/40 focus:outline-none focus:ring-2 focus:ring-[#C79A3E]/40 focus:border-[#C79A3E]" placeholder="••••••••" />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA6B4] hover:text-navy">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isRegister && <p className="text-xs text-[#9AA6B4] mt-1.5">Minimal 6 karakter.</p>}
            </div>

            <button
                  type="submit"
                  disabled={loading}
                  data-testid="member-auth-submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#C79A3E] hover:bg-[#A67C2E] text-white font-semibold py-3.5 rounded-full transition-colors shadow-md disabled:opacity-60"
                  >
                  {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                 isRegister ? "Daftar" : "Masuk"
               )}
            </button>
          </form>

          <p className="text-sm text-center text-[#6B7C90] mt-6">
            {isRegister ? (
              <>Sudah punya akun? <Link to={`/masuk?next=${encodeURIComponent(next)}`} className="font-semibold text-gold hover:underline" data-testid="link-to-login">Masuk</Link></>
            ) : (
              <>Belum punya akun? <Link to={`/daftar?next=${encodeURIComponent(next)}`} className="font-semibold text-gold hover:underline" data-testid="link-to-register">Daftar sekarang</Link></>
            )}
          </p>
        </div>

        <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-sm text-[#6B7C90] hover:text-navy">
          <ArrowLeft className="w-4 h-4" /> Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
