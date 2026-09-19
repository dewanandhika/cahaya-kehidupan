import { X, Loader2 } from "lucide-react";
import { useEffect } from "react";

export function PageHeader({ label, title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        {label && <div className="ck-label mb-2">{label}</div>}
        <h1 className="font-serif-ck text-3xl lg:text-4xl font-semibold tracking-tight text-slate-50">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1.5 max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Btn({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary:
      "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent",
    gold: "bg-amber-500 hover:bg-amber-600 text-slate-950 border-transparent font-semibold",
    ghost:
      "bg-transparent hover:bg-slate-800 text-slate-300 border-slate-700",
    danger: "bg-red-500/90 hover:bg-red-600 text-white border-transparent",
    outline:
      "bg-slate-900/40 hover:bg-slate-800 text-slate-200 border-slate-700",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function StatusBadge({ status }) {
  const map = {
    PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    DRAFT: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    ARCHIVED: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  };
  const label = { PUBLISHED: "Dipublikasikan", DRAFT: "Draf", ARCHIVED: "Diarsipkan" };
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-xs font-mono-ck rounded-full border ${map[status] || map.DRAFT}`}>
      {label[status] || status}
    </span>
  );
}

export function TypeBadge({ type }) {
  const map = {
    ARTICLE:
      "bg-sky-500/10 text-sky-400 border-sky-500/30",

    TADABBUR:
      "bg-amber-500/10 text-amber-400 border-amber-500/30",

    CAHAYA_HIKMAH:
      "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };

  const labels = {
    ARTICLE: "Artikel",
    TADABBUR: "Tadabbur",
    CAHAYA_HIKMAH: "Cahaya Hikmah",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border ${
        map[type] ||
        "bg-slate-500/10 text-slate-400 border-slate-500/30"
      }`}
    >
      {labels[type] || type}
    </span>
  );
}

export function RoleBadge({ role }) {
  const map = {
    SUPER_ADMIN: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    EDITOR: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    AUTHOR: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  };
  const label = { SUPER_ADMIN: "Super Admin", EDITOR: "Editor", AUTHOR: "Author" };
  return (
    <span className={`inline-flex px-2.5 py-0.5 text-xs font-mono-ck rounded-full border ${map[role] || ""}`}>
      {label[role] || role}
    </span>
  );
}

export function Modal({ open, onClose, title, children, footer, testid }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto ck-scroll" data-testid={testid}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ck-card w-full max-w-lg my-8 shadow-2xl ck-fade-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="font-serif-ck text-xl font-semibold text-slate-50">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors" data-testid="modal-close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto ck-scroll">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-800">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">
        {label} {required && <span className="text-amber-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-7 h-7 text-amber-500 animate-spin" />
    </div>
  );
}

export function Empty({ text = "Belum ada data." }) {
  return <div className="text-center py-16 text-slate-500 text-sm">{text}</div>;
}
