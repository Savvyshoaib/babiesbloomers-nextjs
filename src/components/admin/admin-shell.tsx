"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { performClientSignOut } from "@/lib/sign-out";
import {
  CouponIcon,
  BoxIcon,
  CloseIcon,
  CodeIcon,
  FolderIcon,
  HomeIcon,
  ImageIcon,
  LogoutIcon,
  MenuIcon,
  MessageIcon,
  PackageIcon,
  SettingsIcon,
  ShieldIcon,
  StarIcon,
  UsersIcon,
} from "@/components/site/icons";
import {
  roleHasPermission,
  type AdminPermission,
  type RolePermissionMap,
} from "@/lib/roles";

type IconComponent = ComponentType<{ className?: string }>;

type NavItem = {
  label: string;
  href: string;
  icon: IconComponent;
  permission: AdminPermission;
  match?: "exact" | "prefix";
};

const ALL_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: HomeIcon, permission: "dashboard", match: "exact" },
  { label: "Orders", href: "/admin/orders", icon: PackageIcon, permission: "orders" },
  { label: "Customers", href: "/admin/customers", icon: UsersIcon, permission: "customers" },
  { label: "Products", href: "/admin/products", icon: BoxIcon, permission: "products" },
  { label: "Categories", href: "/admin/categories", icon: FolderIcon, permission: "categories" },
  { label: "Contact Queries", href: "/admin/messages", icon: MessageIcon, permission: "messages" },
  { label: "Content", href: "/admin/content", icon: ImageIcon, permission: "content" },
  { label: "Coupons", href: "/admin/coupons", icon: CouponIcon, permission: "coupons" },
  { label: "Reviews", href: "/admin/reviews", icon: StarIcon, permission: "reviews" },
  { label: "Scripts", href: "/admin/scripts", icon: CodeIcon, permission: "scripts" },
  { label: "Roles & Access", href: "/admin/roles", icon: ShieldIcon, permission: "roles" },
  { label: "Settings", href: "/admin/settings", icon: SettingsIcon, permission: "settings" },
];

function isActive(pathname: string, item: NavItem) {
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-poppins text-[13px] font-medium transition-colors ${
        active
          ? "bg-[#fff5f2] text-salmon"
          : "text-body hover:bg-[#fff5f2] hover:text-salmon"
      }`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function AdminShell({
  email,
  role,
  permissions,
  logoUrl,
  children,
}: {
  email: string;
  role: string;
  permissions: RolePermissionMap;
  logoUrl: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = ALL_NAV.filter((item) =>
    roleHasPermission(permissions, role, item.permission),
  );

  const mobilePrimary = navItems.slice(0, 4);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  async function handleSignOut() {
    await performClientSignOut();
  }

  return (
    <div className="min-h-dvh bg-[#f4f2ef]">
      <header className="sticky top-0 z-30 border-b border-[#e8e2dc] bg-white">
        <div className="relative mx-auto flex h-14 max-w-[1400px] items-center justify-center px-4 sm:h-16 sm:px-6 lg:px-8">
          <button
            type="button"
            className="absolute left-3 inline-flex size-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-[#f5f5f5] sm:left-4 lg:hidden"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
          >
            {drawerOpen ? (
              <CloseIcon className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center"
            aria-label="Admin home"
          >
            <Image
              src={logoUrl}
              alt="Babies Bloomers"
              width={842}
              height={180}
              priority
              className="h-9 w-auto max-w-[160px] object-contain sm:h-11 sm:max-w-[200px]"
              unoptimized={logoUrl.startsWith("http")}
            />
          </Link>

          <Link
            href="/"
            className="absolute right-3 font-poppins text-[12px] font-medium text-body transition-colors hover:text-salmon sm:right-4 sm:text-[13px]"
          >
            View store
          </Link>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-ink/40 transition-opacity ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Close menu overlay"
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 flex h-full w-[min(100%,300px)] flex-col bg-white shadow-xl transition-transform duration-300 ease-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-14 items-center justify-between border-b border-[#f0ece8] px-4">
            <Image
              src={logoUrl}
              alt="Babies Bloomers"
              width={842}
              height={180}
              className="h-8 w-auto max-w-[140px] object-contain"
              unoptimized={logoUrl.startsWith("http")}
            />
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-xl text-body hover:bg-[#faf9f7]"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
          <div className="border-b border-[#f0ece8] px-4 py-3">
            <p className="truncate font-poppins text-[13px] font-medium text-ink">
              {email}
            </p>
            <p className="mt-0.5 font-poppins text-[11px] uppercase tracking-wide text-body">
              {role.replace("_", " ")}
            </p>
          </div>
          <nav
            aria-label="Admin mobile menu"
            className="flex-1 overflow-y-auto p-3"
          >
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    active={isActive(pathname, item)}
                    onNavigate={() => setDrawerOpen(false)}
                  />
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-[#f0ece8] p-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-poppins text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <LogoutIcon className="size-4" />
              Sign Out
            </button>
          </div>
        </aside>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:gap-10 lg:px-8">
        <aside className="hidden w-[230px] shrink-0 lg:block">
          <div className="sticky top-[88px] rounded-2xl border border-[#e8e2dc] bg-white p-4 shadow-sm">
            <nav aria-label="Admin navigation">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <NavLink item={item} active={isActive(pathname, item)} />
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-[#f0ece8] pt-4">
                <p className="mb-3 truncate px-3 font-poppins text-[11px] text-body">
                  {email}
                </p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-poppins text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50"
                >
                  <LogoutIcon className="size-4" />
                  Sign Out
                </button>
              </div>
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>
      </div>

      <nav
        aria-label="Admin quick navigation"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e8e2dc] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2.5 font-poppins text-[10px] font-medium ${
                    active ? "text-salmon" : "text-body"
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="max-w-full truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex w-full flex-col items-center gap-0.5 px-1 py-2.5 font-poppins text-[10px] font-medium text-body"
            >
              <MenuIcon className="size-5" />
              More
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
