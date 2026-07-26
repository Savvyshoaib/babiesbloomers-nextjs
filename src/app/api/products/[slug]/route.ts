import { NextResponse } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { fetchCatalogProductBySlug } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const product = await fetchCatalogProductBySlug(slug);
    if (!product) {
      return NextResponse.json(fail("Product not found."), { status: 404 });
    }
    return NextResponse.json(ok("Product loaded.", product));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(fail("Could not load product.", message), {
      status: 500,
    });
  }
}
