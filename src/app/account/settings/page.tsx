import { getCurrentUserProfile, getUserAddresses } from "@/app/actions/auth";
import { SettingsForms } from "@/components/site/settings-forms";

export const revalidate = 0;

export default async function SettingsPage() {
  const profile = await getCurrentUserProfile();
  const addresses = await getUserAddresses();

  // Adapt database profile type to match the component expect type
  const formattedProfile = profile
    ? {
        first_name: (profile as { first_name?: string | null }).first_name ?? null,
        last_name: (profile as { last_name?: string | null }).last_name ?? null,
        phone: (profile as { phone?: string | null }).phone ?? null,
      }
    : null;

  // Format addresses list
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedAddresses = (addresses as any[]) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-fredoka text-[28px] font-semibold text-ink sm:text-[34px]">
          Settings
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Configure profile preferences, contact information and saved billing or shipping destinations.
        </p>
      </div>

      <SettingsForms
        profile={formattedProfile}
        addresses={formattedAddresses}
      />
    </div>
  );
}
