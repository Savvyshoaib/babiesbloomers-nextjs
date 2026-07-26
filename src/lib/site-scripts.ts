import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

function asScriptString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

export async function getSiteScripts(): Promise<{
  header: string;
  footer: string;
}> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("site_settings")
      .select("key, value")
      .in("key", ["header_scripts", "footer_scripts"]);

    const map = new Map(
      (data ?? []).map((row) => [row.key as string, row.value]),
    );

    return {
      header: asScriptString(map.get("header_scripts")),
      footer: asScriptString(map.get("footer_scripts")),
    };
  } catch (err) {
    console.error("[site-scripts] load failed", err);
    return { header: "", footer: "" };
  }
}
