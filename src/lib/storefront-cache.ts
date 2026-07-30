import { revalidatePath } from "next/cache";

/**
 * Bust Next.js Full Route Cache / CDN HTML for the public storefront.
 * Prefer calling this after any admin change that affects customer-facing pages.
 */
export function revalidateStorefront(extraPaths: string[] = []) {
  // Invalidate the entire tree under the root layout (all public pages).
  revalidatePath("/", "layout");

  const paths = new Set([
    "/",
    "/shop",
    "/new-arrivals",
    "/categories",
    "/contact",
    "/cart",
    "/checkout",
    "/compare",
    "/wishlist",
    ...extraPaths,
  ]);

  for (const path of paths) {
    revalidatePath(path);
  }
}
