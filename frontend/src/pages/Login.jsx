import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";
import { Btn } from "@/components/ck";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@cahayakehidupan.id");
  const [password, setPassword] = useState("Cahaya2026!");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] ck-grain flex items-center justify-center p-5">
      <div className="relative z-10 w-full max-w-md">

        {/* Logo & Branding */}
        <div className="text-center mb-8 ck-fade-up">
          <div className="inline-flex items-center justify-center w-29 h-28 rounded-2xl bg-white/95 shadow-xl shadow-amber-900/40 mb-5 p-3">
            <img
              src="/logo-cahaya.png"
              alt="Cahaya Kehidupan"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="font-serif-ck text-4xl font-bold text-slate-50">
            Cahaya Kehidupan
          </h1>

          <p className="text-sm text-slate-400 mt-2 italic font-serif-ck">
            "Kehidupan yang Diterangi Cahaya Tidak Akan Kehilangan Arah"
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={submit}
          className="ck-card p-8 shadow-2xl ck-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="ck-label mb-1">
            Panel Administrasi
          </div>

          <h2 className="font-serif-ck text-2xl font-semibold text-slate-50 mb-6">
            Masuk ke CMS
          </h2>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              data-testid="login-error"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email
              </label>

              <input
                type="email"
                className="ck-input"
                data-testid="input-username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cahayakehidupan.id"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Kata Sandi
              </label>

              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  className="ck-input pr-11"
                  data-testid="input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {show ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

          </div>

          <Btn
            type="submit"
            variant="gold"
            className="w-full mt-6"
            data-testid="btn-login-submit"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Masuk"
            )}
          </Btn>

          <p className="text-xs text-slate-500 mt-5 text-center font-mono-ck">
            Karya oleh Arief Sulistyanto
          </p>
        </form>

      </div>
    </div>
  );
}