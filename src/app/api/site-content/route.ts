import { NextResponse } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { fetchSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await fetchSiteContent();
    return NextResponse.json(ok("Site content loaded.", content));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(fail("Could not load site content.", message), {
      status: 500,
    });
  }
}
