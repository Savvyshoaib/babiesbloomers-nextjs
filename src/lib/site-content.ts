import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DEFAULT_SITE_CONTENT,
  mergeSiteContent,
  type SiteContent,
} from "@/lib/site-content-types";

export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", "site_content")
      .maybeSingle();

    if (error) throw error;
    return mergeSiteContent((data?.value as Partial<SiteContent>) ?? null);
  } catch (err) {
    console.error("[site-content] fetch failed", err);
    return DEFAULT_SITE_CONTENT;
  }
}
