import { NextResponse } from "next/server";
import { ok, fail } from "@/lib/api-response";
import {
  fetchCatalogCategories,
  fetchCatalogProducts,
} from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [products, categories] = await Promise.all([
      fetchCatalogProducts(),
      fetchCatalogCategories(),
    ]);

    return NextResponse.json(
      ok("Catalog loaded.", { products, categories }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(fail("Could not load catalog.", message), {
      status: 500,
    });
  }
}
