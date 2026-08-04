"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  deleteProduct,
  seedCatalogFromSiteData,
  upsertProduct,
  type AdminCategory,
  type AdminProduct,
} from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";
import { ProductImagesField } from "@/components/admin/product-images-field";
import { DEFAULT_EXCLUSIVE_OFFERS, DEFAULT_SIZES } from "@/lib/catalog-types";

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

  const [uploading, setUploading] = useState(false);
  const initialGallery = product?.gallery_images?.length
    ? product.gallery_images
    : product?.image
      ? [product.image]
      : [];

  useEffect(() => {
    if (state?.success && state.data?.id && !product) {
      router.push(`/admin/products/${state.data.id}`);
    }
  }, [state, product, router]);

  const saleValue = product?.price_value ?? "";
  const oldNumeric = product?.old_price
    ? Number(String(product.old_price).replace(/[^\d.]/g, ""))
    : "";

  return (
    <form action={formAction} className="space-y-8">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

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
        <ProductImagesField
          initialFeatured={product?.image ?? ""}
          initialGallery={initialGallery}
          onUploadingChange={setUploading}
        />
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
