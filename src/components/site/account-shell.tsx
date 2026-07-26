"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { signOut } from "@/app/actions/auth";
import {
  HeartIcon,
  HomeIcon,
  LogoutIcon,
  PackageIcon,
  ReceiptIcon,
  SettingsIcon,
} from "@/components/site/icons";

type IconComponent = ComponentType<{ className?: string }>;

const navItems: {
  label: string;
  short: string;
  href: string;
  icon: IconComponent;
  exact?: boolean;
}[] = [
  { label: "Dashboard", short: "Home", href: "/account", icon: HomeIcon, exact: true },
  { label: "My Orders", short: "Orders", href: "/account/orders", icon: PackageIcon },
  { label: "Wishlist", short: "Wish", href: "/account/wishlist", icon: HeartIcon },
  { label: "Invoices", short: "Bills", href: "/account/invoices", icon: ReceiptIcon },
  { label: "Settings", short: "Settings", href: "/account/settings", icon: SettingsIcon },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[#faf9f7]">
      <header className="sticky top-0 z-30 border-b border-[#f0ece8] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-[60px] sm:px-6">
          <Link
            href="/"
            className="font-fredoka text-[15px] font-semibold text-salmon sm:text-[18px]"
          >
            ← Shop
          </Link>
          <span className="truncate font-poppins text-[12px] text-body sm:text-[13px]">
            {email}
          </span>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1200px] gap-8 px-4 py-5 sm:px-6 sm:py-8 lg:gap-12">
        <aside className="hidden w-[220px] shrink-0 lg:block">
          <div className="sticky top-[84px] rounded-2xl border border-[#f0ece8] bg-white p-5 shadow-sm">
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-salmon to-pink text-[24px] font-bold text-white shadow-md">
                {(email?.[0] ?? "U").toUpperCase()}
              </div>
              <p className="mt-3 max-w-full truncate font-poppins text-[12px] text-body">
                {email}
              </p>
            </div>

            <nav aria-label="Account navigation">
              <ul className="space-y-1">
                {navItems.map(({ label, href, icon: Icon, exact }) => {
                  const active = isActive(pathname, href, exact);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-poppins text-[13px] font-medium transition-colors ${
                          active
                            ? "bg-[#fff5f2] text-salmon"
                            : "text-body hover:bg-[#fff5f2] hover:text-salmon"
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 border-t border-[#f0ece8] pt-4">
                <form action={signOut}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-poppins text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    <LogoutIcon className="size-4 shrink-0" />
                    Sign Out
                  </button>
                </form>
              </div>
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
      </div>

      <nav
        aria-label="Account mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#f0ece8] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {navItems.map(({ short, href, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2.5 font-poppins text-[10px] font-medium ${
                    active ? "text-salmon" : "text-body"
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="truncate">{short}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
