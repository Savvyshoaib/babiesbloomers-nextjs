import { createAdminClient } from "@/lib/supabase/admin";
import {
  mergeCheckoutSettings,
  type CheckoutSettings,
} from "@/lib/checkout-settings";

export async function fetchCheckoutSettings(): Promise<CheckoutSettings> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", "checkout_settings")
      .maybeSingle();

    if (data?.value) {
      return mergeCheckoutSettings(data.value);
    }

    // Fallback: legacy shipping_fee number
    const { data: feeRow } = await admin
      .from("site_settings")
      .select("value")
      .eq("key", "shipping_fee")
      .maybeSingle();

    const fee = Number(feeRow?.value);
    if (Number.isFinite(fee) && fee >= 0) {
      return mergeCheckoutSettings({
        shipping: { enabled: true, mode: "fixed", fee, label: "Standard Shipping" },
      });
    }
  } catch {
    /* missing service role / table */
  }

  return mergeCheckoutSettings(null);
}
