import { useEffect, useState } from "react";
import { toast } from "sonner";
import api, { formatApiError, mediaUrl } from "@/lib/api";
import { Modal, Spinner } from "@/components/ck";
import {
  ImageIcon,
  Upload,
  X,
  Check,
  Loader2,
  FileText,
} from "lucide-react";

export default function MediaPicker({
  value,
  onChange,
  label = "Cover",
  accept = "image",
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [uploading, setUploading] = useState(false);

  const isImage = accept === "image";
  const isPdf = accept === "pdf";

  const fileAccept = isImage
    ? "image/jpeg,image/png,image/webp"
    : isPdf
      ? "application/pdf"
      : undefined;

  const load = () => {
    api.get("/media").then((r) => {
      let list = r.data;

      if (isImage) {
        list = list.filter((m) =>
          (m.type || "").startsWith("image")
        );
      }

      if (isPdf) {
        list = list.filter(
          (m) =>
            m.type === "application/pdf" ||
            m.ext === "pdf"
        );
      }

      setItems(list);
    });
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const upload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (isImage && !file.type.startsWith("image/")) {
      toast.error("Silakan pilih file gambar.");
      e.target.value = "";
      return;
    }

    if (isPdf && file.type !== "application/pdf") {
      toast.error("Silakan pilih file PDF.");
      e.target.value = "";
      return;
    }

    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const { data } = await api.post(
        "/media/upload",
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("File diunggah");
      onChange(data.url);
      setOpen(false);
    } catch (err) {
      toast.error(
        formatApiError(err.response?.data?.detail)
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div
        onClick={() => setOpen(true)}
        data-testid="media-picker-trigger"
        className="relative group cursor-pointer rounded-lg border border-dashed border-slate-700 hover:border-amber-500/50 transition-colors overflow-hidden aspect-video bg-[#0D1420] flex items-center justify-center"
      >
        {value ? (
          <>
            {isImage ? (
              <img
                src={mediaUrl(value)}
                alt={label}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-300 p-4 text-center">
                <FileText className="w-10 h-10 text-amber-500" />
                <span className="text-xs break-all">
                  {value.split("/").pop()}
                </span>
                <span className="text-[11px] text-slate-500">
                  File PDF terpilih
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                Ganti {label.toLowerCase()}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-red-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="text-center text-slate-500">
            {isPdf ? (
              <FileText className="w-7 h-7 mx-auto mb-2" />
            ) : (
              <ImageIcon className="w-7 h-7 mx-auto mb-2" />
            )}

            <span className="text-xs">
              Pilih atau unggah {label.toLowerCase()}
            </span>
          </div>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Pilih ${label}`}
        testid="modal-media-picker"
        footer={
          <label className="inline-flex">
            <input
              type="file"
              className="hidden"
              accept={fileAccept}
              onChange={upload}
              data-testid="media-picker-upload"
            />

            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-semibold cursor-pointer transition-colors">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}

              Unggah Baru
            </span>
          </label>
        }
      >
        {items === null ? (
          <Spinner />
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Belum ada {label.toLowerCase()}. Unggah file baru.
          </p>
        ) : (
          <div
            className={
              isImage
                ? "grid grid-cols-3 gap-3"
                : "grid grid-cols-1 gap-3"
            }
          >
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onChange(m.url);
                  setOpen(false);
                }}
                className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                  value === m.url
                    ? "border-amber-500"
                    : "border-transparent hover:border-slate-600"
                } ${
                  isImage
                    ? "aspect-square"
                    : "min-h-[72px]"
                }`}
              >
                {isImage ? (
                  <img
                    src={mediaUrl(m.url)}
                    alt={m.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-[72px] bg-slate-800 flex items-center gap-3 px-4 text-left">
                    <FileText className="w-7 h-7 shrink-0 text-amber-500" />
                    <div className="min-w-0">
                      <div className="text-sm text-slate-200 truncate">
                        {m.filename}
                      </div>
                      <div className="text-xs text-slate-500">
                        PDF
                      </div>
                    </div>
                  </div>
                )}

                {value === m.url && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-slate-950" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}