"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  deleteProduct,
  seedCatalogFromSiteData,
  upsertProduct,
  type AdminCategory,
  type AdminProduct,
} from "@/app/actions/admin";
import { uploadProductImages } from "@/app/actions/upload";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";
import { ButtonSpinner } from "@/components/site/button-spinner";
import { DEFAULT_EXCLUSIVE_OFFERS, DEFAULT_SIZES } from "@/lib/catalog-types";
import { toast } from "sonner";

export function SeedCatalogButton() {
  const { formAction, pending } = useAdminAction(seedCatalogFromSiteData);
  return (
    <form action={formAction}>
      <AdminSubmitButton
        pending={pending}
        label="Import catalog from site data"
        pendingLabel="Importing…"
        variant="ink"
      />
    </form>
  );
}

export function DeleteProductButton({ id }: { id: string }) {
  const { formAction, pending } = useAdminAction(deleteProduct);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Delete this product?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <AdminSubmitButton
        pending={pending}
        label="Delete"
        pendingLabel="Deleting…"
        variant="danger"
      />
    </form>
  );
}

export function ProductForm({
  product,
  categories,
}: {
  product?: AdminProduct | null;
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const { state, formAction, pending } = useAdminAction<{ id: string }>(
    upsertProduct,
  );

  const offers = product?.exclusive_offers?.length
    ? product.exclusive_offers
    : DEFAULT_EXCLUSIVE_OFFERS;

  const [featured, setFeatured] = useState(product?.image ?? "");
  const [gallery, setGallery] = useState<string[]>(
    product?.gallery_images?.length
      ? product.gallery_images
      : product?.image
        ? [product.image]
        : [],
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (state?.success && state.data?.id && !product) {
      router.push(`/admin/products/${state.data.id}`);
    }
  }, [state, product, router]);

  async function onUpload(
    files: FileList | null,
    mode: "featured" | "gallery",
  ) {
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const result = await uploadProductImages(fd);
    setUploading(false);

    if (!result.success || !result.data?.urls?.length) {
      toast.error(result.message || "Upload failed");
      return;
    }

    toast.success(result.message);
    if (mode === "featured") {
      setFeatured(result.data.urls[0]!);
      setGallery((prev) =>
        prev.includes(result.data!.urls[0]!)
          ? prev
          : [result.data!.urls[0]!, ...prev],
      );
    } else {
      setGallery((prev) => [...prev, ...result.data!.urls]);
      if (!featured) setFeatured(result.data.urls[0]!);
    }
  }

  const saleValue = product?.price_value ?? "";
  const oldNumeric = product?.old_price
    ? Number(String(product.old_price).replace(/[^\d.]/g, ""))
    : "";

  return (
    <form action={formAction} className="space-y-8">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="image" value={featured} />
      <input type="hidden" name="galleryImages" value={gallery.join("|")} />

      <section className="space-y-4">
        <h3 className="font-poppins text-[15px] font-semibold text-ink">
          Basic details
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Title
            </label>
            <input
              name="title"
              required
              defaultValue={product?.title ?? ""}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Product code
            </label>
            <input
              name="productCode"
              defaultValue={
                product?.product_code ??
                product?.slug?.slice(0, 8).toUpperCase() ??
                ""
              }
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Slug
            </label>
            <input
              name="slug"
              defaultValue={product?.slug ?? ""}
              placeholder="auto from title"
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Category
            </label>
            <select
              name="category"
              required
              defaultValue={product?.categories?.[0] ?? ""}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] bg-white px-3.5 font-poppins text-[14px] text-ink"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Quantity (stock)
            </label>
            <input
              name="stock"
              type="number"
              defaultValue={product?.stock ?? 100}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Price (regular)
            </label>
            <input
              name="oldPriceValue"
              type="number"
              step="0.01"
              defaultValue={oldNumeric}
              placeholder="e.g. 1999"
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
            />
            <input type="hidden" name="oldPrice" defaultValue={product?.old_price ?? ""} />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Sale Price
            </label>
            <input
              name="salePriceValue"
              type="number"
              step="0.01"
              required
              defaultValue={saleValue}
              placeholder="e.g. 1499"
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
            />
            <input type="hidden" name="salePrice" defaultValue={product?.price ?? ""} />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Badge
            </label>
            <input
              name="badge"
              defaultValue={product?.badge ?? "new"}
              placeholder="new / sale"
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Status
            </label>
            <select
              name="status"
              defaultValue={product?.status ?? "active"}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] bg-white px-3.5 font-poppins text-[14px] text-ink"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block font-poppins text-[13px] font-medium text-ink">
              Sizes (comma-separated)
            </label>
            <input
              name="sizes"
              defaultValue={(product?.sizes?.length
                ? product.sizes
                : DEFAULT_SIZES
              ).join(", ")}
              className="h-11 w-full rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
            />
          </div>
          <label className="flex items-center gap-2 font-poppins text-[13px] text-ink">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product?.is_featured}
              className="size-4 accent-salmon"
            />
            Show on Home (Featured / Top picks)
          </label>
          <label className="flex items-center gap-2 font-poppins text-[13px] text-ink">
            <input
              type="checkbox"
              name="isNewArrival"
              defaultChecked={product?.is_new_arrival ?? true}
              className="size-4 accent-salmon"
            />
            New Arrivals page
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-poppins text-[15px] font-semibold text-ink">
          Images
        </h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 font-poppins text-[13px] font-medium text-ink">
              Featured image
            </p>
            <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d0c8c0] bg-[#faf9f7] px-4 text-center hover:border-salmon">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => onUpload(e.target.files, "featured")}
              />
              {uploading ? (
                <ButtonSpinner />
              ) : featured ? (
                <div className="relative size-28 overflow-hidden rounded-lg">
                  <Image src={featured} alt="" fill className="object-cover" />
                </div>
              ) : (
                <span className="font-poppins text-[13px] text-body">
                  Click to upload featured image
                </span>
              )}
            </label>
          </div>
          <div>
            <p className="mb-2 font-poppins text-[13px] font-medium text-ink">
              Gallery images (multiple)
            </p>
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#d0c8c0] bg-[#faf9f7] px-4 py-4 text-center hover:border-salmon">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => onUpload(e.target.files, "gallery")}
              />
              <span className="font-poppins text-[13px] text-body">
                Click to upload gallery images from your computer
              </span>
              {gallery.length > 0 ? (
                <ul className="flex flex-wrap justify-center gap-2">
                  {gallery.map((src) => (
                    <li key={src} className="relative size-16 overflow-hidden rounded-md">
                      <Image src={src} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        className="absolute right-0 top-0 bg-red-500 px-1 text-[10px] text-white"
                        onClick={(e) => {
                          e.preventDefault();
                          setGallery((prev) => prev.filter((g) => g !== src));
                          if (featured === src) setFeatured("");
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-poppins text-[15px] font-semibold text-ink">
          Exclusive Offer
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="offer1"
            defaultValue={offers[0]?.title}
            className="h-11 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
          />
          <input
            name="offer2"
            defaultValue={offers[1]?.title}
            className="h-11 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
          />
          <input
            name="offer3"
            defaultValue={offers[2]?.title}
            className="h-11 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
          />
          <input
            name="offer4"
            defaultValue={offers[3]?.title}
            className="h-11 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-poppins text-[15px] font-semibold text-ink">
          Description
        </h3>
        <textarea
          name="description"
          rows={5}
          defaultValue={product?.description ?? ""}
          placeholder="One bullet per line"
          className="w-full rounded-lg border border-[#cfcfcf] px-3.5 py-2.5 font-poppins text-[14px] text-ink"
        />
      </section>

      <section className="space-y-4">
        <h3 className="font-poppins text-[15px] font-semibold text-ink">
          Additional Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <input
            name="material"
            defaultValue={product?.additional_info?.material ?? "Premium cotton blend"}
            placeholder="Material"
            className="h-11 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
          />
          <input
            name="care"
            defaultValue={
              product?.additional_info?.care ??
              "Machine wash gentle, tumble dry low"
            }
            placeholder="Care"
            className="h-11 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
          />
          <input
            name="origin"
            defaultValue={product?.additional_info?.origin ?? "Pakistan"}
            placeholder="Origin"
            className="h-11 rounded-lg border border-[#cfcfcf] px-3.5 font-poppins text-[14px] text-ink"
          />
        </div>
        <p className="font-poppins text-[12px] text-body">
          Reviews tab shows count from database (default 0) until a reviews
          module is added.
        </p>
      </section>

      <AdminSubmitButton
        pending={pending || uploading}
        label={product ? "Save product" : "Create product"}
      />
    </form>
  );
}
