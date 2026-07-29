import { getAdminSettings } from "@/app/actions/admin";
import { requirePermission } from "@/lib/admin";
import { SettingsForms } from "./settings-client";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  await requirePermission("settings");
  const settings = await getAdminSettings();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-fredoka text-[24px] font-semibold text-ink sm:text-[28px]">
          Store settings
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Shipping, payment methods, bank details, custom checkout sections, and
          promo strip. Coupons are under Coupons.
        </p>
      </div>
      <SettingsForms settings={settings} />
    </div>
  );
}
