import React from "react";

function getYouTubeId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // youtube.com/watch?v=...
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }

    // youtu.be/...
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").split("?")[0];
    }

    // youtube.com/embed/...
    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1].split("/")[0];
    }

    return null;
  } catch {
    return null;
  }
}

export default function CahayaHikmahVideo({
  videoUrl,
  title = "Cahaya Hikmah",
}) {
  const videoId = getYouTubeId(videoUrl);

  if (!videoUrl) {
    return (
      <div className="aspect-video rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
        Video belum tersedia.
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-sm text-slate-500">
          URL video belum dapat dikenali.
        </p>

        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex mt-3 items-center rounded-full bg-[#C79A3E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#A67C2E] transition-colors"
        >
          Buka Video
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-xl">
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}