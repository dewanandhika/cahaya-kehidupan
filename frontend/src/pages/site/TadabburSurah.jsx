import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import pub from "@/lib/publicApi";
import { PageHero, PostCard, Loader, EmptyState } from "@/components/site/ui";
import { ArrowLeft } from "lucide-react";

export default function TadabburSurah() {
  const { surah } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => { pub.get(`/tadabbur/surah/${surah}`).then((r) => setData(r.data)).catch(() => setData(false)); }, [surah]);

  if (data === null) return <Loader />;
  if (data === false) return <EmptyState text="Surah tidak ditemukan." />;

  return (
    <div>
      <PageHero eyebrow={`Surah ke-${data.surah.number} · ${data.surah.total_ayah} ayat`}
        title={`${data.surah.name} — ${data.surah.arabic_name}`}
        subtitle={`Kumpulan tadabbur atas surah ${data.surah.name}.`} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/tadabbur" className="inline-flex items-center gap-2 text-sm font-semibold text-gold mb-8"><ArrowLeft className="w-4 h-4" /> Semua Surah</Link>
        {data.posts.length === 0 ? <EmptyState text="Belum ada tadabbur untuk surah ini." /> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
