import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pub, { mediaUrl } from "@/lib/publicApi";
import { PageHero, Loader, EmptyState } from "@/components/site/ui";
import { Layers, ArrowRight } from "lucide-react";

export default function Koleksi() {
  const [cols, setCols] = useState(null);
  useEffect(() => { pub.get("/collections").then((r) => setCols(r.data)).catch(() => setCols([])); }, []);

  return (
    <div>
      <PageHero eyebrow="Koleksi Tematik" title="Koleksi Tulisan"
        subtitle="Rangkaian tulisan yang dihimpun berdasarkan tema tertentu untuk memudahkan pembacaan." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {cols === null ? <Loader /> : cols.length === 0 ? <EmptyState text="Belum ada koleksi." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cols.map((c) => (
              <Link key={c.id} to={`/koleksi/${c.slug}`} data-testid={`collection-${c.slug}`} className="card-hover group bg-white rounded-xl overflow-hidden border border-[#EAE3D3]">
                <div className="aspect-[16/9] bg-navy relative overflow-hidden">
                  {c.cover ? <img src={mediaUrl(c.cover)} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy to-[#0F2438]"><Layers className="w-10 h-10 text-gold" /></div>}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-navy group-hover:text-gold transition-colors">{c.name}</h3>
                  <p className="text-sm text-[#5C6B7C] mt-2 line-clamp-2">{c.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8A7B57]">{c.count} tulisan</span>
                    <ArrowRight className="w-4 h-4 text-gold" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
