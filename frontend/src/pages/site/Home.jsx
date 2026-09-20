import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pub, { mediaUrl } from "@/lib/publicApi";
import { SectionHeading, PostCard, WorkCard, Loader } from "@/components/site/ui";
import CahayaHikmahVideo from "@/components/CahayaHikmahVideo";
import { BookOpen, FileText, Layers, BookMarked, ArrowRight, ChevronRight, Quote } from "lucide-react";

const QUICK = [
  {
    to: "/tadabbur",
    icon: BookOpen,
    title: "Tadabbur",
    desc: "Membaca ayat Al-Qur'an dan menemukan pesannya dalam kehidupan.",
    cta: "Jelajahi",
    image: "/tadabbur.png",
  },
  {
    to: "/artikel",
    icon: FileText,
    title: "Artikel",
    desc: "Refleksi, pemikiran, dan inspirasi untuk kehidupan yang lebih baik.",
    cta: "Baca Artikel",
    image: "/artikel.png",
  },
  {
    to: "/buku",
    icon: BookMarked,
    title: "Buku & Risalah",
    desc: "Karya yang menyajikan pemikiran secara utuh dan mendalam.",
    cta: "Lihat Koleksi",
    image: "/buku-risalah.png",
  },
  {
    to: "/koleksi",
    icon: Layers,
    title: "Koleksi",
    desc: "Rangkaian tulisan berdasarkan tema tertentu untuk memudahkan pembacaan.",
    cta: "Lihat Koleksi",
    image: "/koleksi.png",
  },
];

export default function Home() {
  const [data, setData] = useState(null);
  useEffect(() => { pub.get("/home").then((r) => setData(r.data)).catch(() => setData(false)); }, []);

  if (!data) return <Loader />;
  const s = data.settings || {};

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy">
        <div className="absolute inset-0">
          <img src="/hero-cahaya-kehidupan.png" alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 site-fade">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] text-white">
              <span className="text-gold">CAHAYA</span><br />KEHIDUPAN
            </h1>
            <p className="mt-6 font-read text-xl sm:text-2xl text-white/90 leading-relaxed max-w-xl">
              {s.tagline || "Kehidupan yang Diterangi Cahaya Tidak Akan Kehilangan Arah"}
            </p>
            <div className="mt-6 flex items-start gap-3 text-white/80">
              <Quote className="w-6 h-6 text-gold shrink-0" />
              <p className="font-read italic text-lg">"Allah adalah Cahaya langit dan bumi." <span className="text-gold not-italic font-semibold">— QS. An-Nur: 35</span></p>
            </div>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
  to="/artikel"
  data-testid="hero-cta-explore"
  className="inline-flex items-center gap-2 bg-[#C79A3E] hover:bg-[#A67C2E] text-white font-semibold px-7 py-3.5 rounded-full transition-colors shadow-lg shadow-black/20"
>
  Jelajahi Tulisan
  <ArrowRight className="w-4 h-4" />
</Link>
              <Link to="/tentang-penulis" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-full transition-colors backdrop-blur">
                Tentang Penulis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 relative z-10">
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
    {QUICK.map((c) => (
      <Link
        key={c.to}
        to={c.to}
        data-testid={`quick-${c.title}`}
        className="group relative h-[210px] sm:h-[220px] lg:h-[230px] overflow-hidden rounded-2xl border border-[#EAE3D3] shadow-md card-hover"
      >
    {/* Background Image */}
    <img
  src={c.image}
  alt={c.title}
  className="absolute inset-0 w-full h-full object-cover object-right transition-transform duration-500 group-hover:scale-105"
/>

    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />

    {/* Content */}
    <div className="relative z-10 h-full p-4 sm:p-5 flex flex-col justify-end text-white">
      <div className="w-10 h-10 rounded-lg bg-white/95 flex items-center justify-center mb-3 shadow-lg">
  <c.icon className="w-5 h-5 text-gold" />
</div>

      <h3 className="font-display text-xl lg:text-[22px] font-bold text-white">
        {c.title}
      </h3>

      <p className="text-xs sm:text-sm text-white/85 mt-1.5 leading-relaxed line-clamp-2">
        {c.desc}
      </p>

      <span className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gold">
        {c.cta}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </span>
    </div>
  </Link>
))}
        </div>
      </section>

      {/* LATEST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <SectionHeading title="Tulisan Terbaru" to="/artikel" />
        {data.latest.length === 0 ? (
          <p className="text-[#8A93A0]">Belum ada tulisan yang dipublikasikan.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.latest.slice(0, 4).map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
      {/* CAHAYA HIKMAH */}
      {data.cahaya_hikmah?.length > 0 && (
        <section className="bg-navy py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <div className="gold-rule mb-4" />
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Cahaya Hikmah
                </h2>
                <p className="mt-2 text-white/70 font-read">
                  Menyimak hikmah dan pesan kehidupan melalui video.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {data.cahaya_hikmah.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl"
                >
                  <CahayaHikmahVideo
                    videoUrl={item.video_url}
                    title={item.title}
                  />

                  <div className="p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-gold mb-2">
                      CAHAYA HIKMAH
                    </div>

                    <h3 className="font-display text-xl font-bold text-navy leading-snug">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="mt-2 text-sm text-[#5C6B7C] leading-relaxed line-clamp-2">
                        {item.excerpt}
                      </p>
                    )}

                    {item.gallery_images?.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {item.gallery_images.slice(0, 2).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={item.title}
                            className="w-full h-auto object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    {item.published_at && (
                      <p className="mt-4 text-xs text-[#8A7B57]">
                        {new Date(item.published_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* CATEGORIES */}
      {data.categories.length > 0 && (
        <section className="bg-cream-2 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeading title="Kategori Tulisan" to="/artikel" linkLabel="Semua Artikel" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
              {data.categories.map((c) => (
                <Link key={c.id} to={`/artikel?kategori=${c.slug}`} className="card-hover bg-white rounded-xl p-5 border border-[#EAE3D3] flex items-center justify-between">
                  <div>
                    <div className="font-display text-lg font-bold text-navy">{c.name}</div>
                    <div className="text-xs text-[#8A7B57] mt-1">{c.count} tulisan</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gold" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BOOKS & COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <SectionHeading title="Buku & Risalah Terbaru" to="/buku" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...data.books.map((b) => ({ ...b, _k: "buku" })), ...data.risalahs.map((r) => ({ ...r, _k: "risalah" }))].slice(0, 4).map((b) => (
              <WorkCard key={b.id} item={b} kind={b._k} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeading title="Koleksi Pilihan" to="/koleksi" />
          <div className="space-y-3">
            {data.collections.slice(0, 5).map((c) => (
              <Link key={c.id} to={`/koleksi/${c.slug}`} className="card-hover flex items-center gap-4 bg-white rounded-xl p-4 border border-[#EAE3D3]">
                <div className="w-12 h-12 rounded-lg bg-softblue flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-navy" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-navy leading-snug line-clamp-1">{c.name}</div>
                  <div className="text-xs text-[#8A7B57] mt-0.5">{c.count} tulisan</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gold shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT + QUOTE */}
      <section className="bg-cream-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="gold-rule mb-4" />
            <h2 className="font-display text-3xl font-bold text-navy">Tentang Cahaya Kehidupan</h2>
            <p className="mt-5 text-[#4A5A6C] leading-relaxed font-read text-lg">
              {s.author_bio || "Cahaya Kehidupan adalah rumah digital untuk menghimpun, mengarsipkan, dan membagikan tulisan, tadabbur, serta buku karya Arief Sulistyanto kepada komunitas dan publik."}
            </p>
            <Link to="/tentang-penulis" className="mt-7 inline-flex items-center gap-2 bg-gold hover:bg-[#A67C2E] text-white font-semibold px-6 py-3 rounded-full transition-colors">
              Pelajari Lebih Lanjut <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="relative bg-navy rounded-2xl p-10 text-white overflow-hidden">
            <Quote className="w-14 h-14 text-gold/40 mb-4" />
            <p className="font-read italic text-2xl leading-relaxed">"Ilmu yang bermanfaat adalah cahaya yang terus menerangi kehidupan."</p>
            <p className="mt-6 text-gold font-semibold">— {data.author?.name || "Arief Sulistyanto"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
