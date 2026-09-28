import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pub from "@/lib/publicApi";
import { PostCard, Loader } from "@/components/site/ui";
import { Quote, FileText, BookOpen, BookMarked, Scroll, ArrowRight } from "lucide-react";

export default function Tentang() {
  const [data, setData] = useState(null);
  useEffect(() => { pub.get("/about").then((r) => setData(r.data)).catch(() => setData(false)); }, []);

  if (!data) return <Loader />;
  const a = data.author || {};
  const s = data.settings?.general || {};
  const stats = [
    { icon: FileText, label: "Artikel", value: data.stats.articles },
    { icon: BookOpen, label: "Tadabbur", value: data.stats.tadabbur },
    { icon: BookMarked, label: "Buku", value: data.stats.books },
    { icon: Scroll, label: "Risalah", value: data.stats.risalahs },
  ];

  return (
    <div>
      {/* Profile hero */}
      <section className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-3 gap-10 items-center site-fade">
          <div className="flex justify-center">
            <div className="w-44 h-44 rounded-full bg-gradient-to-br from-gold to-[#8A6420] flex items-center justify-center overflow-hidden ring-4 ring-white/10">
  <img
    src="/foto-arief-sulistyanto.png"
    alt="Foto penulis"
    className="w-full h-full object-cover"
  />
</div>
          </div>
          <div className="md:col-span-2 text-center md:text-left">
            <div className="text-gold text-xs font-bold uppercase tracking-[0.25em] mb-2">Tentang Penulis</div>
            <h1 className="font-display text-4xl sm:text-5xl font-black">{a.name || "Arief Sulistyanto"}</h1>
            <p className="mt-4 font-read text-lg text-white/80 leading-relaxed">{a.bio || s.author_bio || "Penulis, pemikir, dan penghimpun tadabbur, artikel, buku, serta risalah."}</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((st) => (
            <div key={st.label} className="bg-white rounded-xl border border-[#EAE3D3] p-6 text-center shadow-sm">
              <st.icon className="w-6 h-6 text-gold mx-auto mb-3" />
              <div className="font-display text-3xl font-black text-navy">{st.value}</div>
              <div className="text-xs text-[#8A7B57] mt-1">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Background & Thoughts */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-10">
        <div>
          <div className="gold-rule mb-3" />
          <h2 className="font-display text-2xl font-bold text-navy mb-4">Latar & Pemikiran</h2>
          <div className="article-body">
            <p>Arief Sulistyanto menghimpun berbagai tulisan yang berangkat dari pengamatan atas kehidupan sehari-hari, kebangsaan, keadilan, kepemimpinan, hingga peradaban. Setiap tulisan berusaha menghadirkan cahaya — sudut pandang yang menuntun agar kehidupan tidak kehilangan arah.</p>
            <p>Melalui tadabbur ayat Al-Qur'an, artikel reflektif, serta buku dan risalah, karya-karya ini dimaksudkan sebagai bekal renungan bagi siapa pun yang ingin memaknai perjalanan hidupnya secara lebih dalam.</p>
          </div>
        </div>

        <div className="bg-cream-2 rounded-2xl p-8 sm:p-10 border border-[#EAE3D3] relative">
          <Quote className="w-12 h-12 text-gold/40 mb-3" />
          <p className="font-read italic text-2xl text-navy leading-relaxed">"Ilmu yang bermanfaat adalah cahaya yang terus menerangi kehidupan."</p>
          <p className="mt-4 text-gold font-semibold">— {a.name || "Arief Sulistyanto"}</p>
        </div>
      </section>

      {/* Works */}
      {data.latest?.length > 0 && (
        <section className="bg-cream-2 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-7">
              <div><div className="gold-rule mb-3" /><h2 className="font-display text-2xl font-bold text-navy">Karya Terbaru</h2></div>
              <Link to="/artikel" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold">Lihat Semua <ArrowRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {data.latest.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
