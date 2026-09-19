import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import pub from "@/lib/publicApi";
import { Loader } from "@/components/site/ui";
import CahayaHikmahVideo from "@/components/CahayaHikmahVideo";
import { ArrowRight, CalendarDays, PlayCircle } from "lucide-react";

export default function CahayaHikmah() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    pub
      .get("/posts?type=CAHAYA_HIKMAH")
      .then((r) => setItems(r.data))
      .catch(() => setItems([]));
  }, []);

  if (items === null) return <Loader />;

  return (
    <div className="min-h-screen bg-[#F8F6F0]">
      {/* HEADER */}
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-96 h-96 rounded-full bg-gold blur-3xl -top-40 -right-20" />
          <div className="absolute w-80 h-80 rounded-full bg-gold blur-3xl -bottom-40 -left-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-gold text-sm font-bold uppercase tracking-[0.18em]">
              <PlayCircle className="w-5 h-5" />
              CAHAYA KEHIDUPAN
            </div>

            <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white">
              Cahaya Hikmah
            </h1>

            <p className="mt-5 font-read text-lg sm:text-xl text-white/75 leading-relaxed">
              Menyimak hikmah, pemikiran, dan pesan kehidupan melalui video
              serta dokumentasi foto.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <PlayCircle className="w-14 h-14 text-slate-300 mx-auto" />

            <h2 className="mt-5 font-display text-2xl font-bold text-navy">
              Belum Ada Cahaya Hikmah
            </h2>

            <p className="mt-2 text-slate-500">
              Konten Cahaya Hikmah yang telah dipublikasikan akan muncul di
              halaman ini.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <div className="gold-rule mb-3" />

                <h2 className="font-display text-3xl font-bold text-navy">
                  Koleksi Cahaya Hikmah
                </h2>

                <p className="mt-2 text-slate-500">
                  {items.length} konten tersedia
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#EAE3D3] shadow-sm hover:shadow-xl transition-shadow"
                >
                  <CahayaHikmahVideo
                    videoUrl={item.video_url}
                    title={item.title}
                  />

                  <div className="p-6">
                    <div className="text-xs font-bold uppercase tracking-wider text-gold">
                      CAHAYA HIKMAH
                    </div>

                    <h2 className="mt-2 font-display text-2xl font-bold text-navy leading-snug">
                      {item.title}
                    </h2>

                    {item.excerpt && (
                      <p className="mt-3 text-[#5C6B7C] leading-relaxed">
                        {item.excerpt}
                      </p>
                    )}

                    {item.gallery_images?.length > 0 && (
                      <div className="mt-6">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#8A7B57] mb-3">
                          FOTO-FOTO
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {item.gallery_images.slice(0, 6).map((image, index) => (
                            <a
                              key={index}
                              href={image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100"
                            >
                              <img
                                src={image}
                                alt={`${item.title} - Foto ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.published_at && (
                      <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                        <CalendarDays className="w-4 h-4" />

                        {new Date(item.published_at).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </div>
                    )}

                    <Link
                      to={`/artikel/${item.slug}`}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gold hover:text-[#A67C2E]"
                    >
                      Lihat Selengkapnya
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}