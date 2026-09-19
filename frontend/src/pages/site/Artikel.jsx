import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import pub from "@/lib/publicApi";
import { PageHero, PostCard, Loader, EmptyState } from "@/components/site/ui";

export default function Artikel() {
  const [sp, setSp] = useSearchParams();
  const [cats, setCats] = useState([]);
  const [tags, setTags] = useState([]);
  const [posts, setPosts] = useState(null);

  const kategori = sp.get("kategori") || "";
  const subkategori = sp.get("subkategori") || "";
  const tag = sp.get("tag") || "";

  useEffect(() => {
    pub.get("/categories").then((r) => setCats(r.data));
    pub.get("/tags").then((r) => setTags(r.data));
  }, []);

  useEffect(() => {
    setPosts(null);
    const params = { type: "ARTICLE" };
    if (kategori) params.category = kategori;
    if (subkategori) params.subcategory = subkategori;
    if (tag) params.tag = tag;
    pub.get("/posts", { params }).then((r) => setPosts(r.data)).catch(() => setPosts([]));
  }, [kategori, subkategori, tag]);

  const setParam = (k, v) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v); else next.delete(k);
    if (k === "kategori") next.delete("subkategori");
    setSp(next);
  };

  const activeCat = useMemo(() => cats.find((c) => c.slug === kategori), [cats, kategori]);

  return (
    <div>
      <PageHero eyebrow="Artikel & Pemikiran" title="Refleksi Kehidupan"
        subtitle="Artikel, refleksi, dan pemikiran tentang kehidupan, kebangsaan, keadilan, dan peradaban." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setParam("kategori", "")} data-testid="filter-cat-all"
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${!kategori ? "bg-navy text-white border-navy" : "bg-white text-navy border-[#E6DDC8] hover:border-navy"}`}>Semua</button>
          {cats.map((c) => (
            <button key={c.id} onClick={() => setParam("kategori", c.slug)} data-testid={`filter-cat-${c.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${kategori === c.slug ? "bg-navy text-white border-navy" : "bg-white text-navy border-[#E6DDC8] hover:border-navy"}`}>
              {c.name} <span className="opacity-60">({c.count})</span>
            </button>
          ))}
        </div>

        {activeCat && activeCat.subcategories?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setParam("subkategori", "")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${!subkategori ? "bg-gold text-white border-gold" : "bg-white text-[#5C6B7C] border-[#E6DDC8]"}`}>Semua Subkategori</button>
            {activeCat.subcategories.map((s) => (
              <button key={s.id} onClick={() => setParam("subkategori", s.slug)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${subkategori === s.slug ? "bg-gold text-white border-gold" : "bg-white text-[#5C6B7C] border-[#E6DDC8]"}`}>{s.name}</button>
            ))}
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tag && <button onClick={() => setParam("tag", "")} className="px-3 py-1 rounded-full text-xs font-semibold bg-navy text-white">Tag: {tag} ✕</button>}
            {!tag && tags.slice(0, 12).map((t) => (
              <button key={t.id} onClick={() => setParam("tag", t.slug)} className="px-3 py-1 rounded-full text-xs text-[#8A7B57] bg-cream-2 hover:bg-softblue border border-[#EAE3D3]">#{t.name}</button>
            ))}
          </div>
        )}

        {posts === null ? <Loader /> : posts.length === 0 ? <EmptyState text="Tidak ada artikel yang cocok." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
