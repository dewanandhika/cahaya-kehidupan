import { useEffect, useState } from "react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { PageHeader, Btn, Field, Spinner } from "@/components/ck";
import MediaPicker from "@/components/MediaPicker";
import { Save, Globe, Search, Home } from "lucide-react";

const TABS = [
  { id: "general", label: "Pengaturan Situs", icon: Globe, testid: "tab-general" },
  { id: "seo", label: "SEO & Meta", icon: Search, testid: "tab-seo" },
  { id: "homepage", label: "Homepage", icon: Home, testid: "tab-homepage" },
];

export default function Settings() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => setData(r.data)).catch(() => setData(false));
  }, []);

  const setField = (section, key, value) =>
    setData((d) => ({ ...d, [section]: { ...d[section], [key]: value } }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/settings", { general: data.general, seo: data.seo, homepage: data.homepage });
      toast.success("Pengaturan disimpan");
    } catch (e) { toast.error(formatApiError(e.response?.data?.detail)); }
    finally { setSaving(false); }
  };

  if (!data) return <Spinner />;

  return (
    <div className="ck-fade-up">
      <PageHeader
        label="Sistem"
        title="Pengaturan"
        subtitle="Konfigurasi situs, metadata SEO, dan tampilan homepage."
        action={<Btn variant="gold" onClick={save} disabled={saving} data-testid="btn-save-settings"><Save className="w-4 h-4" /> Simpan Perubahan</Btn>}
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={t.testid}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm border transition-all ${tab === t.id ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-slate-900/40 text-slate-400 border-slate-700 hover:border-slate-500"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="ck-card p-6 max-w-2xl space-y-5">
        {tab === "general" && (
          <>
            <Field label="Judul Platform"><input className="ck-input" data-testid="settings-title" value={data.general?.title || ""} onChange={(e) => setField("general", "title", e.target.value)} /></Field>
            <Field label="Tagline"><input className="ck-input" data-testid="settings-tagline" value={data.general?.tagline || ""} onChange={(e) => setField("general", "tagline", e.target.value)} /></Field>
            <Field label="Bio Penulis Utama"><textarea className="ck-input min-h-[90px]" value={data.general?.author_bio || ""} onChange={(e) => setField("general", "author_bio", e.target.value)} /></Field>
            <Field label="Teks Footer"><input className="ck-input" value={data.general?.footer_text || ""} onChange={(e) => setField("general", "footer_text", e.target.value)} /></Field>
            <Field label="Logo"><div className="max-w-xs"><MediaPicker value={data.general?.logo || ""} onChange={(v) => setField("general", "logo", v)} label="Logo" /></div></Field>
          </>
        )}
        {tab === "seo" && (
          <>
            <Field label="Meta Title Default"><input className="ck-input" data-testid="settings-meta-title" value={data.seo?.meta_title || ""} onChange={(e) => setField("seo", "meta_title", e.target.value)} /></Field>
            <Field label="Meta Description Default"><textarea className="ck-input min-h-[90px]" data-testid="settings-meta-desc" value={data.seo?.meta_description || ""} onChange={(e) => setField("seo", "meta_description", e.target.value)} /></Field>
            <Field label="Kode Google Search Console"><input className="ck-input font-mono-ck text-sm" value={data.seo?.search_console_code || ""} onChange={(e) => setField("seo", "search_console_code", e.target.value)} /></Field>
            <Field label="OpenGraph Image"><div className="max-w-sm"><MediaPicker value={data.seo?.og_image || ""} onChange={(v) => setField("seo", "og_image", v)} label="OG Image" /></div></Field>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Izinkan Indexing Mesin Pencari</span>
              <button type="button" onClick={() => setField("seo", "robots_index", !data.seo?.robots_index)} data-testid="settings-robots-toggle"
                className={`relative w-11 h-6 rounded-full transition-colors ${data.seo?.robots_index ? "bg-emerald-500" : "bg-slate-700"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${data.seo?.robots_index ? "translate-x-5" : ""}`} />
              </button>
            </label>
          </>
        )}
        {tab === "homepage" && (
          <>
            <Field label="Judul Hero"><input className="ck-input" data-testid="settings-hero-title" value={data.homepage?.hero_title || ""} onChange={(e) => setField("homepage", "hero_title", e.target.value)} /></Field>
            <Field label="Subjudul Hero"><input className="ck-input" value={data.homepage?.hero_subtitle || ""} onChange={(e) => setField("homepage", "hero_subtitle", e.target.value)} /></Field>
            <label className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Tampilkan Tadabbur Terbaru di Homepage</span>
              <button type="button" onClick={() => setField("homepage", "show_latest_tadabbur", !data.homepage?.show_latest_tadabbur)} data-testid="settings-tadabbur-toggle"
                className={`relative w-11 h-6 rounded-full transition-colors ${data.homepage?.show_latest_tadabbur ? "bg-emerald-500" : "bg-slate-700"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${data.homepage?.show_latest_tadabbur ? "translate-x-5" : ""}`} />
              </button>
            </label>
          </>
        )}
      </div>
    </div>
  );
}
