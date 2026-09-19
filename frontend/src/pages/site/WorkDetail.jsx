import { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import pub, { mediaUrl } from "@/lib/publicApi";
import { Loader, EmptyState } from "@/components/site/ui";
import { ArrowLeft, Download, BookOpen, User, Calendar, Lock } from "lucide-react";

export default function WorkDetail({ kind }) {
  const { slug } = useParams();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const readRef = useRef();
  const endpoint = kind === "buku" ? "book" : kind;
  useEffect(() => { setItem(null); pub.get(`/${endpoint}/${slug}`).then((r) => setItem(r.data)).catch(() => setItem(false)); }, [kind, slug]);

  if (item === null) return <Loader />;
  if (item === false) return <div className="max-w-3xl mx-auto px-4 py-24"><EmptyState text="Tidak ditemukan." /></div>;

  const paras = (item.content || "").split(/\n\n+/).filter(Boolean);
  const label = kind === "buku" ? "Buku" : "Risalah";
  const locked = item.locked;
  const loginUrl = `/masuk?next=${encodeURIComponent(location.pathname)}`;

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-3 gap-10 items-start site-fade">
          <div className="rounded-xl overflow-hidden bg-[#0F2438] aspect-[3/4] shadow-2xl">
            {item.cover ? <img src={mediaUrl(item.cover)} alt={item.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-14 h-14 text-gold" /></div>}
          </div>
          <div className="md:col-span-2">
            <Link to={kind === "buku" ? "/buku" : "/risalah"} className="inline-flex items-center gap-2 text-sm font-semibold text-gold mb-5"><ArrowLeft className="w-4 h-4" /> Semua {label}</Link>
            <div className="text-gold text-xs font-bold uppercase tracking-[0.25em] mb-2">{label}</div>
            <h1 className="font-display text-3xl sm:text-4xl font-black leading-tight">{item.title}</h1>
            {item.subtitle && <p className="mt-3 font-read text-lg text-white/80 italic">{item.subtitle}</p>}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-white/70">
              <span className="inline-flex items-center gap-1.5"><User className="w-4 h-4" /> {item.author?.name || "Arief Sulistyanto"}</span>
              {item.year && <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {item.year}</span>}
            </div>
            {item.description && <p className="mt-5 font-read text-white/80 leading-relaxed">{item.description}</p>}
            <div className="mt-7 flex flex-wrap gap-3">
              {locked ? (
                <Link to={loginUrl} data-testid="btn-login-to-read"
                  className="inline-flex items-center gap-2 bg-[#C79A3E] hover:bg-[#A67C2E] text-white font-semibold px-6 py-3 rounded-full transition-colors">
                  <Lock className="w-4 h-4" /> Masuk untuk Membaca
                </Link>
              ) : (
                <button onClick={() => readRef.current?.scrollIntoView({ behavior: "smooth" })} data-testid="btn-read-online"
                  className="inline-flex items-center gap-2 bg-gold hover:bg-[#A67C2E] text-white font-semibold px-6 py-3 rounded-full transition-colors">
                  <BookOpen className="w-4 h-4" /> Baca Online
                </button>
              )}
              {!locked && item.download_enabled && item.pdf_file && (
                <a href={mediaUrl(item.pdf_file)} target="_blank" rel="noreferrer" data-testid="btn-download-pdf"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-6 py-3 rounded-full transition-colors">
                  <Download className="w-4 h-4" /> Unduh PDF
                </a>
              )}
              {locked && item.download_enabled && (
                <Link to={loginUrl} data-testid="btn-login-to-download"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-6 py-3 rounded-full transition-colors">
                  <Download className="w-4 h-4" /> Unduh PDF
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div ref={readRef} className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        {locked ? (
          <div className="text-center bg-cream-2 border border-[#EAE3D3] rounded-2xl p-10 sm:p-14">
            <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-gold" />
            </div>
            <h3 className="font-display text-2xl font-bold text-navy">Konten Khusus Member</h3>
            <p className="text-[#5C6B7C] mt-3 max-w-md mx-auto">Silakan masuk atau daftar (gratis) untuk membaca naskah lengkap dan mengunduh PDF {label.toLowerCase()} ini.</p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link to={loginUrl}className="inline-flex items-center gap-2 bg-[#C79A3E] hover:bg-[#A67C2E] text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5">Masuk</Link>
              <Link
  to={`/daftar?next=${encodeURIComponent(location.pathname)}`}
  className="inline-flex items-center gap-2 bg-white hover:bg-[#E5E7EB] border border-[#E6DDC8] hover:border-[#CBD5E1] text-navy font-semibold px-6 py-3 rounded-full transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
>
  Daftar Gratis
</Link>
            </div>
          </div>
        ) : paras.length === 0 ? <EmptyState text="Naskah belum tersedia untuk dibaca online." /> : (
          <div className="article-body">{paras.map((p, i) => <p key={i}>{p}</p>)}</div>
        )}
      </div>
    </div>
  );
}
