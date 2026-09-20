import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import pub, { mediaUrl, fmtDate } from "@/lib/publicApi";
import { Loader, EmptyState, TypePill, PostCard } from "@/components/site/ui";
import { ArrowLeft, Calendar, User, Tag as TagIcon, Lock, LogIn } from "lucide-react";

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  useEffect(() => { setPost(null); pub.get(`/post/${slug}`).then((r) => setPost(r.data)).catch(() => setPost(false)); }, [slug]);

  if (post === null) return <Loader />;
  if (post === false) return <div className="max-w-3xl mx-auto px-4 py-24"><EmptyState text="Tulisan tidak ditemukan." /></div>;

  const isT = post.type === "TADABBUR";
  const paras = (post.content || "").split(/\n\n+/).filter(Boolean);
  const back = isT ? "/tadabbur" : "/artikel";

  return (
    <div>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 site-fade">
        <Link to={back} className="inline-flex items-center gap-2 text-sm font-semibold text-gold mb-8"><ArrowLeft className="w-4 h-4" /> Kembali</Link>

        <div className="flex items-center gap-3 mb-4">
          <TypePill type={post.type} />
          {post.category && <Link to={`/artikel?kategori=${post.category.slug}`} className="text-xs font-semibold text-[#8A7B57] uppercase tracking-wide">{post.category.name}</Link>}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-navy leading-tight">{post.title}</h1>
        {post.subtitle && <p className="mt-4 font-read text-xl text-[#5C6B7C] italic">{post.subtitle}</p>}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 pb-6 border-b border-[#EAE3D3] text-sm text-[#8A93A0]">
          <span className="inline-flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author?.name || "Arief Sulistyanto"}</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {fmtDate(post.published_at || post.created_at)}</span>
        </div>

        {isT && post.surah && (
          <div className="mt-8 bg-navy text-white rounded-2xl p-8 text-center">
            <div className="font-arabic text-4xl text-gold mb-3">{post.surah.arabic_name}</div>
            <div className="font-display text-2xl font-bold">QS. {post.surah.name} : {post.ayat_number}</div>
            {post.theme && <div className="mt-3 inline-block px-4 py-1 rounded-full bg-gold/20 text-gold text-sm font-semibold">Tema: {post.theme}</div>}
          </div>
        )}

        {post.cover_image && (
          <img src={mediaUrl(post.cover_image)} alt={post.title} className="w-full rounded-2xl mt-8 object-cover" />
        )}

        <div className="article-body mt-10">
  {paras.map((p, i) => <p key={i}>{p}</p>)}
</div>

{post.locked && (
  <div className="mt-10 rounded-2xl border border-[#E6DDC8] bg-cream-2 p-6 sm:p-8 text-center">
    <div className="mx-auto w-12 h-12 rounded-full bg-[#C79A3E]/15 flex items-center justify-center mb-4">
      <Lock className="w-5 h-5 text-gold" />
    </div>

    <h3 className="font-display text-xl sm:text-2xl font-bold text-navy">
      Ingin membaca tulisan selengkapnya?
    </h3>

    <p className="mt-2 text-sm sm:text-base text-[#5C6B7C] max-w-xl mx-auto leading-relaxed">
      Daftar sebagai member Cahaya Kehidupan untuk mendapatkan akses
      membaca tulisan secara lengkap setelah akun disetujui oleh Owner.
    </p>

    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
      <Link
        to="/daftar"
        className="inline-flex items-center justify-center gap-2 bg-[#C79A3E] hover:bg-[#A67C2E] text-white font-semibold px-6 py-3 rounded-full transition-colors"
      >
        Daftar sebagai Member
      </Link>

      <Link
       to="/masuk"
        className="inline-flex items-center justify-center gap-2 border border-[#C79A3E] text-[#8A6A24] hover:bg-[#C79A3E]/10 font-semibold px-6 py-3 rounded-full transition-colors"
      >
        <LogIn className="w-4 h-4" />
        Sudah punya akun? Masuk
      </Link>
    </div>
  </div>
)}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-10 pt-8 border-t border-[#EAE3D3]">
            <TagIcon className="w-4 h-4 text-gold" />
            {post.tags.map((t) => (
              <Link key={t.id} to={`/artikel?tag=${t.slug}`} className="px-3 py-1 rounded-full text-xs text-[#8A7B57] bg-cream-2 border border-[#EAE3D3] hover:bg-softblue">#{t.name}</Link>
            ))}
          </div>
        )}

        {post.collections?.length > 0 && (
          <div className="mt-6 text-sm text-[#5C6B7C]">
            Bagian dari koleksi:{" "}
            {post.collections.map((c, i) => (
              <span key={c.id}>{i > 0 && ", "}<Link to={`/koleksi/${c.slug}`} className="font-semibold text-navy hover:text-gold">{c.name}</Link></span>
            ))}
          </div>
        )}
      </article>

      {post.related?.length > 0 && (
        <section className="bg-cream-2 py-14 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-2xl font-bold text-navy mb-6">Tulisan Terkait</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {post.related.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
