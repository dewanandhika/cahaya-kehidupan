import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import pub from "@/lib/publicApi";
import { PostCard, WorkCard, Loader } from "@/components/site/ui";
import { Layers, Search as SearchIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Cari() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const [input, setInput] = useState(q);
  const [res, setRes] = useState(null);

  useEffect(() => { setInput(q); }, [q]);
  useEffect(() => {
    if (!q) { setRes(null); return; }
    setRes(null);
    pub.get("/search", { params: { q } }).then((r) => setRes(r.data)).catch(() => setRes(false));
  }, [q]);

  const submit = (e) => { e.preventDefault(); if (input.trim()) setSp({ q: input.trim() }); };

  const total = res ? (res.tadabbur.length + res.articles.length + res.books.length + res.risalahs.length + res.collections.length) : 0;

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center site-fade">
          <div className="gold-rule mx-auto mb-4" />
          <h1 className="font-display text-4xl font-black">Pencarian</h1>
          <form onSubmit={submit} className="mt-8 relative">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-navy/50" />
            <input value={input} onChange={(e) => setInput(e.target.value)} autoFocus data-testid="search-page-input"
              placeholder="Cari tulisan, ayat, tema, atau kata kunci..."
              className="w-full pl-14 pr-32 py-4 rounded-full bg-white text-navy placeholder:text-[#9AA6B4] focus:outline-none focus:ring-4 focus:ring-gold/30" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-gold hover:bg-[#A67C2E] text-white font-semibold px-6 py-2.5 rounded-full transition-colors">Cari</button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {!q ? (
          <p className="text-center text-[#8A93A0] py-16">Masukkan kata kunci untuk mulai mencari.</p>
        ) : res === null ? <Loader /> : (
          <>
            <p className="text-[#5C6B7C] mb-10"><span className="font-bold text-navy">{total}</span> hasil untuk "<span className="font-semibold text-navy">{q}</span>"</p>

            {total === 0 && <p className="text-center text-[#8A93A0] py-16">Tidak ada hasil. Coba kata kunci lain.</p>}

            <Group title="Tadabbur" count={res.tadabbur.length}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{res.tadabbur.map((p) => <PostCard key={p.id} post={p} />)}</div>
            </Group>
            <Group title="Artikel" count={res.articles.length}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{res.articles.map((p) => <PostCard key={p.id} post={p} />)}</div>
            </Group>
            <Group title="Buku" count={res.books.length}>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">{res.books.map((b) => <WorkCard key={b.id} item={b} kind="buku" />)}</div>
            </Group>
            <Group title="Risalah" count={res.risalahs.length}>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">{res.risalahs.map((b) => <WorkCard key={b.id} item={b} kind="risalah" />)}</div>
            </Group>
            <Group title="Koleksi" count={res.collections.length}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {res.collections.map((c) => (
                  <Link key={c.id} to={`/koleksi/${c.slug}`} className="card-hover flex items-center gap-4 bg-white rounded-xl p-4 border border-[#EAE3D3]">
                    <div className="w-11 h-11 rounded-lg bg-softblue flex items-center justify-center"><Layers className="w-5 h-5 text-navy" /></div>
                    <div className="flex-1 min-w-0"><div className="font-display font-bold text-navy line-clamp-1">{c.name}</div><div className="text-xs text-[#8A7B57]">{c.count} tulisan</div></div>
                    <ArrowRight className="w-4 h-4 text-gold" />
                  </Link>
                ))}
              </div>
            </Group>
          </>
        )}
      </div>
    </div>
  );
}

function Group({ title, count, children }) {
  if (!count) return null;
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display text-2xl font-bold text-navy">{title}</h2>
        <span className="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-bold">{count}</span>
      </div>
      {children}
    </div>
  );
}
