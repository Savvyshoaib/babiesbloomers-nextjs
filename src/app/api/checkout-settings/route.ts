import { NextResponse } from "next/server";
import { fetchCheckoutSettings } from "@/lib/checkout-settings-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await fetchCheckoutSettings();
  return NextResponse.json({ success: true, data: settings });
}
