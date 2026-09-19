import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pub from "@/lib/publicApi";
import { PageHero, Loader, EmptyState } from "@/components/site/ui";
import { Search, ChevronRight, BookOpen } from "lucide-react";

export default function Tadabbur() {
  const [surahs, setSurahs] = useState(null);
  const [q, setQ] = useState("");
  useEffect(() => { pub.get("/tadabbur/surahs").then((r) => setSurahs(r.data)).catch(() => setSurahs([])); }, []);

  const filtered = (surahs || []).filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.arabic_name?.includes(q));
  const total = (surahs || []).reduce((a, s) => a + s.count, 0);

  return (
    <div>
      <PageHero eyebrow="Tadabbur Al-Qur'an" title="Merenungi Cahaya Ayat"
        subtitle="Kumpulan tadabbur dan renungan atas ayat-ayat Al-Qur'an, disusun berdasarkan surah." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <p className="text-[#5C6B7C]"><span className="font-bold text-navy">{total}</span> tulisan dalam <span className="font-bold text-navy">{surahs?.length || 0}</span> surah</p>
          <div className="relative sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA6B4]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} data-testid="tadabbur-search"
              placeholder="Cari surah..." className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white border border-[#E6DDC8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C79A3E]/40" />
          </div>
        </div>

        {surahs === null ? <Loader /> : filtered.length === 0 ? <EmptyState text="Belum ada tadabbur." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => (
              <Link key={s.id} to={`/tadabbur/${s.slug}`} data-testid={`surah-${s.slug}`} className="card-hover bg-white rounded-xl p-6 border border-[#EAE3D3] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-navy text-gold flex items-center justify-center font-display font-bold shrink-0">{s.number}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-xl font-bold text-navy">{s.name}</div>
                  <div className="text-sm text-[#8A7B57]">{s.count} tulisan · {s.total_ayah} ayat</div>
                </div>
                <div className="font-arabic text-2xl text-gold">{s.arabic_name}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
