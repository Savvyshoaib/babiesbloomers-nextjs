import { fetchSiteContent } from "@/lib/site-content";
import { requirePermission } from "@/lib/admin";
import { SiteContentForms } from "./content-client";

export const revalidate = 0;

export default async function AdminContentPage() {
  await requirePermission("content");
  const content = await fetchSiteContent();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-fredoka text-[24px] font-semibold text-ink sm:text-[28px]">
          Site Content
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Edit branding, banners, contact page, social links, testimonials,
          and vision — changes appear on the storefront.
        </p>
      </div>

      <SiteContentForms initial={content} />
    </div>
  );
}
