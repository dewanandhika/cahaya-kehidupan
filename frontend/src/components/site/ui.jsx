import { Link } from "react-router-dom";
import { mediaUrl, fmtDate } from "@/lib/publicApi";
import { BookOpen, FileText, ArrowRight, Loader2, Download } from "lucide-react";

export function SectionHeading({ title, to, linkLabel = "Lihat Semua" }) {
  return (
    <div className="flex items-end justify-between mb-7">
      <div>
        <div className="gold-rule mb-3" />
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-[#A67C2E]">
          {linkLabel} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}

export function TypePill({ type }) {
  const isT = type === "TADABBUR";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold tracking-wide uppercase ${isT ? "bg-gold text-white" : "bg-navy text-white"}`}>
      {isT ? "Tadabbur" : "Artikel"}
    </span>
  );
}

export function Loader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-gold animate-spin" />
    </div>
  );
}

export function EmptyState({ text = "Belum ada tulisan." }) {
  return <div className="text-center py-20 text-[#8A93A0]">{text}</div>;
}

export function PageHero({ eyebrow, title, subtitle }) {
  return (
    <div className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 site-fade">
        {eyebrow && <div className="text-gold text-xs font-bold uppercase tracking-[0.25em] mb-3">{eyebrow}</div>}
        <h1 className="font-display text-4xl sm:text-5xl font-bold">{title}</h1>
        {subtitle && <p className="mt-4 text-white/70 max-w-2xl text-lg font-read">{subtitle}</p>}
      </div>
    </div>
  );
}

export function PostCard({ post }) {
  const to = post.type === "TADABBUR"
    ? `/tadabbur/${post.surah ? (post.surah.slug || post.surah.number) : "umum"}/${post.slug}`
    : `/artikel/${post.category?.slug || "umum"}/${post.slug}`;
  return (
    <Link to={to} data-testid={`post-card-${post.slug}`} className="card-hover group flex flex-col bg-white rounded-xl overflow-hidden border border-[#EAE3D3]">
      <div className="relative aspect-[16/10] overflow-hidden bg-softblue">
        {post.cover_image ? (
          <img src={mediaUrl(post.cover_image)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8F0F7] to-[#F4EEE1]">
            {post.type === "TADABBUR" ? <BookOpen className="w-10 h-10 text-navy/25" /> : <FileText className="w-10 h-10 text-navy/25" />}
          </div>
        )}
        <div className="absolute top-3 left-3"><TypePill type={post.type} /></div>
        <div className="absolute top-3 right-3 text-[11px] font-semibold text-white bg-navy/70 px-2 py-1 rounded backdrop-blur">{fmtDate(post.published_at || post.created_at)}</div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display text-lg font-bold text-navy leading-snug line-clamp-2 group-hover:text-gold transition-colors">{post.title}</h3>
        {post.subtitle && <p className="mt-1.5 text-sm text-[#5C6B7C] line-clamp-2">{post.subtitle}</p>}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#8A7B57]">
            {post.type === "TADABBUR" ? `QS. ${post.surah?.name || ""}${post.ayat_number ? `: ${post.ayat_number}` : ""}` : (post.category?.name || post.subtitle || "")}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-gold">Baca <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </Link>
  );
}

export function WorkCard({ item, kind }) {
  return (
    <Link to={`/${kind}/${item.slug}`} data-testid={`work-card-${item.slug}`} className="card-hover group flex flex-col bg-white rounded-xl overflow-hidden border border-[#EAE3D3]">
      <div className="relative aspect-[3/4] overflow-hidden bg-navy">
        {item.cover ? (
          <img src={mediaUrl(item.cover)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-navy to-[#0F2438] text-white p-4 text-center">
            <BookOpen className="w-9 h-9 text-gold mb-3" />
            <span className="font-display text-lg font-bold leading-snug">{item.title}</span>
          </div>
        )}
        {item.download_enabled && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-gold text-white text-[10px] font-bold px-2 py-1 rounded"><Download className="w-3 h-3" /> PDF</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-base font-bold text-navy leading-snug line-clamp-2 group-hover:text-gold transition-colors">{item.title}</h3>
        <p className="text-xs text-[#8A7B57] mt-1">{item.author?.name || "Arief Sulistyanto"}{item.year ? ` · ${item.year}` : ""}</p>
      </div>
    </Link>
  );
}
