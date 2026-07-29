import { listCoupons } from "@/app/actions/coupons";
import { requirePermission } from "@/lib/admin";
import { CouponsClient } from "./coupons-client";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  await requirePermission("coupons");
  const coupons = await listCoupons();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-fredoka text-[24px] font-semibold text-ink sm:text-[28px]">
          Coupons
        </h1>
        <p className="mt-1 font-poppins text-[14px] text-body">
          Create promo codes, schedule start/expiry, activate or deactivate.
          Expired coupons stop working automatically on checkout.
        </p>
      </div>
      <CouponsClient initial={coupons} />
    </div>
  );
}
