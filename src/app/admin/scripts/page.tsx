import { getAdminSettings } from "@/app/actions/admin";
import { requirePermission } from "@/lib/admin";
import { ScriptsForms } from "./scripts-client";

export const revalidate = 0;

function asScript(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

export default async function AdminScriptsPage() {
  await requirePermission("scripts");
  const settings = await getAdminSettings();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-fredoka text-[24px] font-semibold text-ink sm:text-[28px]">
          Scripts
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Add custom header or footer code that updates live on the website.
        </p>
      </div>

      <ScriptsForms
        headerScripts={asScript(settings.header_scripts)}
        footerScripts={asScript(settings.footer_scripts)}
      />
    </div>
  );
}
