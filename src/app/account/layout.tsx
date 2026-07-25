import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { signOut } from "@/app/actions/auth";
import {
  HomeIcon,
  PackageIcon,
  ReceiptIcon,
  SettingsIcon,
  UserIcon,
} from "@/components/site/icons";
import type { ReactNode } from "react";

const navItems = [
  { label: "Dashboard", href: "/account", icon: HomeIcon },
  { label: "My Orders", href: "/account/orders", icon: PackageIcon },
  { label: "Invoices", href: "/account/invoices", icon: ReceiptIcon },
  { label: "Settings", href: "/account/settings", icon: SettingsIcon },
];

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Top bar */}
      <div className="border-b border-[#f0ece8] bg-white">
        <div className="shell flex h-[60px] items-center justify-between">
          <Link
            href="/"
            className="font-fredoka text-[18px] font-semibold text-salmon"
          >
            ← Back to Shop
          </Link>
          <span className="font-poppins text-[13px] text-body">
            {session.email}
          </span>
        </div>
      </div>

      <div className="shell py-8">
        <div className="flex gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className="hidden w-[220px] shrink-0 lg:block">
            <div className="sticky top-6 rounded-2xl border border-[#f0ece8] bg-white p-5 shadow-sm">
              {/* Avatar */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-salmon to-pink text-[24px] font-bold text-white shadow-md">
                  {(session.email?.[0] ?? "U").toUpperCase()}
                </div>
                <p className="mt-3 max-w-full truncate font-poppins text-[12px] text-body">
                  {session.email}
                </p>
              </div>

              <nav aria-label="Account navigation">
                <ul className="space-y-1">
                  {navItems.map(({ label, href, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-poppins text-[13px] font-medium text-body transition-colors hover:bg-[#fff5f2] hover:text-salmon"
                      >
                        <Icon className="size-4 shrink-0" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t border-[#f0ece8] pt-4">
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-poppins text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      <UserIcon className="size-4 shrink-0" />
                      Sign Out
                    </button>
                  </form>
                </div>
              </nav>
            </div>
          </aside>

          {/* Mobile bottom nav */}
          <nav
            aria-label="Account mobile navigation"
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#f0ece8] bg-white lg:hidden"
          >
            <ul className="flex">
              {navItems.map(({ label, href, icon: Icon }) => (
                <li key={href} className="flex-1">
                  <Link
                    href={href}
                    className="flex flex-col items-center gap-1 py-3 font-poppins text-[10px] text-body hover:text-salmon"
                  >
                    <Icon className="size-5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Main content */}
          <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
