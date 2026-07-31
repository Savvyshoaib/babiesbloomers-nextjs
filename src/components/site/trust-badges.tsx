"use client";

import { usePathname } from "next/navigation";
import { MessageIcon, ShieldCheckIcon, TruckIcon } from "./icons";

function PremiumQualityIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M8.5 12.3 7 21l5-2.6 5 2.6-1.5-8.7" />
    </svg>
  );
}

const badges = [
  { icon: TruckIcon, title: "Fast Shipping", desc: "Quick delivery nationwide" },
  { icon: ShieldCheckIcon, title: "Secure Checkout", desc: "100% protected payments" },
  { icon: MessageIcon, title: "Online Support", desc: "We're here to help, anytime" },
  { icon: PremiumQualityIcon, title: "Premium Quality", desc: "Crafted with the finest fabrics" },
];

const HIDDEN_ON_PATHS = new Set(["/cart", "/checkout"]);

export function TrustBadges() {
  const pathname = usePathname();
  if (HIDDEN_ON_PATHS.has(pathname)) return null;

  return (
    <section
      className="shell mt-[70px] max-[880px]:mt-[40px]"
      aria-label="Why shop with us"
    >
      <div className="grid grid-cols-2 gap-x-3 gap-y-5 overflow-hidden border-y border-[#eee] py-6 sm:grid-cols-4 sm:gap-4 sm:py-8">
        {badges.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex min-w-0 items-start gap-2.5 sm:flex-col sm:items-center sm:gap-2.5 sm:text-center"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-salmon text-ink sm:size-[60px]">
              <Icon className="size-5 sm:size-7" />
            </span>
            <div className="min-w-0">
              <p className="font-poppins text-[13px] font-semibold leading-5 text-ink sm:text-[14px]">
                {title}
              </p>
              <p className="mt-0.5 font-poppins text-[11px] leading-4 text-body sm:text-[12px]">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
