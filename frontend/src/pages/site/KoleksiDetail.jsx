import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import pub from "@/lib/publicApi";
import { PageHero, PostCard, Loader, EmptyState } from "@/components/site/ui";
import { ArrowLeft } from "lucide-react";

export default function KoleksiDetail() {
  const { slug } = useParams();
  const [col, setCol] = useState(null);
  useEffect(() => { setCol(null); pub.get(`/collection/${slug}`).then((r) => setCol(r.data)).catch(() => setCol(false)); }, [slug]);

  if (col === null) return <Loader />;
  if (col === false) return <div className="max-w-3xl mx-auto px-4 py-24"><EmptyState text="Koleksi tidak ditemukan." /></div>;

  return (
    <div>
      <PageHero eyebrow={`Koleksi · ${col.count} tulisan`} title={col.name} subtitle={col.description} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/koleksi" className="inline-flex items-center gap-2 text-sm font-semibold text-gold mb-8"><ArrowLeft className="w-4 h-4" /> Semua Koleksi</Link>
        {col.posts.length === 0 ? <EmptyState text="Belum ada tulisan dalam koleksi ini." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {col.posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
