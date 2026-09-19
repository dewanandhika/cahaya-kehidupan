import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import pub from "@/lib/publicApi";
import { PageHero, WorkCard, Loader, EmptyState } from "@/components/site/ui";

export default function Library({ defaultTab = "buku" }) {
  const [tab, setTab] = useState(defaultTab);
  const [books, setBooks] = useState(null);
  const [risalahs, setRisalahs] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { setTab(defaultTab); }, [defaultTab]);
  useEffect(() => {
    pub.get("/books").then((r) => setBooks(r.data)).catch(() => setBooks([]));
    pub.get("/risalahs").then((r) => setRisalahs(r.data)).catch(() => setRisalahs([]));
  }, []);

  const switchTab = (t) => { setTab(t); navigate(t === "buku" ? "/buku" : "/risalah", { replace: true }); };
  const items = tab === "buku" ? books : risalahs;

  return (
    <div>
      <PageHero eyebrow="Perpustakaan" title="Buku & Risalah"
        subtitle="Karya lengkap Arief Sulistyanto yang menyajikan pemikiran secara utuh dan mendalam." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex gap-3 mb-8">
          <button onClick={() => switchTab("buku")} data-testid="tab-buku"
            className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all ${tab === "buku" ? "bg-navy text-white border-navy" : "bg-white text-navy border-[#E6DDC8] hover:border-navy"}`}>
            Buku {books ? `(${books.length})` : ""}
          </button>
          <button onClick={() => switchTab("risalah")} data-testid="tab-risalah"
            className={`px-6 py-2.5 rounded-full text-sm font-bold border transition-all ${tab === "risalah" ? "bg-navy text-white border-navy" : "bg-white text-navy border-[#E6DDC8] hover:border-navy"}`}>
            Risalah {risalahs ? `(${risalahs.length})` : ""}
          </button>
        </div>

        {items === null ? <Loader /> : items.length === 0 ? <EmptyState text={`Belum ada ${tab}.`} /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {items.map((b) => <WorkCard key={b.id} item={b} kind={tab} />)}
          </div>
        )}
      </div>
    </div>
  );
}
