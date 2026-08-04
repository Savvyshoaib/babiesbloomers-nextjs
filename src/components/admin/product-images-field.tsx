"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteFileFromStorage, uploadFileToStorage } from "@/lib/upload-to-storage";
import { CloseIcon, PlusIcon } from "@/components/site/icons";

const BUCKET = "product-images";

type ImageItem = {
  id: string;
  url: string;
  progress: number;
  status: "uploading" | "done" | "removing";
  file?: File;
};

let itemSeq = 0;
function nextId() {
  itemSeq += 1;
  return `img-${Date.now()}-${itemSeq}`;
}

export function ProductImagesField({
  initialFeatured,
  initialGallery,
  onUploadingChange,
}: {
  initialFeatured: string;
  initialGallery: string[];
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [items, setItems] = useState<ImageItem[]>(() => {
    const seen = new Set<string>();
    const initial: ImageItem[] = [];
    for (const url of [initialFeatured, ...initialGallery]) {
      if (url && !seen.has(url)) {
        seen.add(url);
        initial.push({ id: url, url, progress: 100, status: "done" });
      }
    }
    return initial;
  });
  const [featuredId, setFeaturedId] = useState(initialFeatured || "");

  const doneItems = items.filter((i) => i.status === "done");
  const featuredUrl =
    doneItems.find((i) => i.id === featuredId)?.url ?? doneItems[0]?.url ?? "";
  const galleryUrls = doneItems.map((i) => i.url);
  const anyUploading = items.some((i) => i.status === "uploading");

  useEffect(() => {
    onUploadingChange?.(anyUploading);
  }, [anyUploading, onUploadingChange]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const newItems: ImageItem[] = Array.from(fileList).map((file) => ({
      id: nextId(),
      url: "",
      progress: 0,
      status: "uploading",
      file,
    }));
    setItems((prev) => [...prev, ...newItems]);

    for (const item of newItems) {
      uploadFileToStorage({
        bucket: BUCKET,
        file: item.file!,
        onProgress: (progress) => {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress } : i)),
          );
        },
      })
        .then((url) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, url, status: "done", progress: 100 } : i,
            ),
          );
          setFeaturedId((prev) => prev || item.id);
        })
        .catch((err) => {
          toast.error(err instanceof Error ? err.message : "Image upload failed");
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        });
    }
  }

  async function removeItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (item.status === "uploading") {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }

    if (!confirm("Remove this image? It will be permanently deleted.")) return;

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "removing" } : i)),
    );
    try {
      await deleteFileFromStorage(BUCKET, item.url);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (featuredId === id) setFeaturedId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove image");
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "done" } : i)),
      );
    }
  }

  return (
    <div>
      <input type="hidden" name="image" value={featuredUrl} />
      <input type="hidden" name="galleryImages" value={galleryUrls.join("|")} />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.id}
            className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-[#faf9f7] ${
              item.status === "done" && item.id === featuredId
                ? "border-salmon"
                : "border-[#e5e2dd]"
            }`}
          >
            {item.status === "uploading" ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-3">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e5e2dd]">
                  <div
                    className="h-full rounded-full bg-salmon transition-[width]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <span className="font-poppins text-[11px] text-body">
                  {item.progress}%
                </span>
              </div>
            ) : (
              <>
                <Image
                  src={item.url}
                  alt=""
                  fill
                  sizes="140px"
                  className={`object-cover ${item.status === "removing" ? "opacity-40" : ""}`}
                  unoptimized={item.url.startsWith("http")}
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={item.status === "removing"}
                  aria-label="Remove image"
                  className="absolute left-1.5 top-1.5 flex size-7 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600 right-0 disabled:opacity-60"
                >
                  <CloseIcon className="size-3.5" />
                </button>
                {item.status === "removing" ? (
                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/90 px-2 py-1 font-poppins text-[10px] font-semibold text-body">
                    Removing…
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFeaturedId(item.id)}
                    className={`absolute bottom-1.5 left-1.5 rounded-full px-2 py-1 font-poppins text-[10px] font-semibold transition-colors ${
                      item.id === featuredId
                        ? "bg-salmon text-white"
                        : "bg-white/90 text-ink hover:bg-white"
                    }`}
                  >
                    {item.id === featuredId ? "★ Featured" : "Set featured"}
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#d0c8c0] bg-[#faf9f7] text-center transition-colors hover:border-salmon">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <PlusIcon className="size-5 text-body" />
          <span className="font-poppins text-[11px] text-body">Add images</span>
        </label>
      </div>
      <p className="mt-2 font-poppins text-[12px] text-body">
        Upload one or more images at once. Click &quot;Set featured&quot; on
        any image to use it as the main product photo — the rest stay in the
        gallery.
      </p>
    </div>
  );
}
