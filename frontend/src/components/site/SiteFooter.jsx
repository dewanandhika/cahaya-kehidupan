import { Link } from "react-router-dom";
import { Youtube, Instagram, Facebook, Twitter, Send } from "lucide-react";

const NAV = [
  ["/", "Beranda"], ["/tadabbur", "Tadabbur"], ["/artikel", "Artikel"],
  ["/buku", "Buku & Risalah"], ["/koleksi", "Koleksi"], ["/tentang-penulis", "Tentang Penulis"],
];

export default function SiteFooter() {
  return (
    <footer className="bg-navy text-white/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <img src="/logo-cahaya.png" alt="Cahaya Kehidupan" className="h-10 w-10 object-contain" />
              <div>
                <div className="font-display text-lg font-extrabold text-white">CAHAYA KEHIDUPAN</div>
                <div className="text-[11px] italic text-white/50">Kehidupan yang Diterangi Cahaya Tidak Akan Kehilangan Arah</div>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            {NAV.map(([to, label]) => (
              <Link key={to} to={to} className="text-sm text-white/70 hover:text-gold transition-colors">{label}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {[Youtube, Instagram, Facebook, Twitter, Send].map((Ico, i) => (
              <span key={i} className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:text-gold hover:border-gold/40 transition-colors cursor-pointer">
                <Ico className="w-4 h-4" />
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
          <span>© {new Date().getFullYear()} Cahaya Kehidupan. All rights reserved.</span>
          <span className="italic">Karya untuk Kehidupan yang Lebih Baik</span>
        </div>
      </div>
    </footer>
  );
}
