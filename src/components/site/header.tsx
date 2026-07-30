"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useSavedProducts } from "@/lib/saved-products-context";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";
import { navLinks } from "@/lib/site-data";
import { performClientSignOut } from "@/lib/sign-out";
import {
  CategoriesDesktopMegaMenu,
  CategoriesMobileAccordion,
} from "./categories-menu";
import { SiteSearch } from "./site-search";
import {
  BagIcon,
  CloseIcon,
  CompareIcon,
  HeartIcon,
  MenuIcon,
  UserIcon,
} from "./icons";

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, ready } = useCart();
  const badgeCount = ready ? itemCount : 0;
  const {
    wishlistCount,
    compareCount,
    ready: savedReady,
  } = useSavedProducts();
  const wishlistBadge = savedReady ? wishlistCount : 0;
  const compareBadge = savedReady ? compareCount : 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const user = useAppSelector((s) => s.auth.user);
  const profile = useAppSelector((s) => s.auth.profile);
  const initialized = useAppSelector((s) => s.auth.initialized);
  const { branding } = useAppSelector(selectSiteContent);
  const isStaff =
    profile?.role === "admin" || profile?.role === "shop_manager";

  const accountMenuItems = isStaff
    ? [
        { label: "Admin Dashboard", href: "/admin" },
        ...(profile?.role === "admin"
          ? [
              { label: "Orders", href: "/admin/orders" },
              { label: "Products", href: "/admin/products" },
              { label: "Customers", href: "/admin/customers" },
              { label: "Roles & Access", href: "/admin/roles" },
              { label: "Settings", href: "/admin/settings" },
            ]
          : []),
        { label: "My account", href: "/account" },
      ]
    : [
        { label: "Dashboard", href: "/account" },
        { label: "My Orders", href: "/account/orders" },
        { label: "Wishlist", href: "/account/wishlist" },
        { label: "Invoices", href: "/account/invoices" },
        { label: "Settings", href: "/account/settings" },
      ];

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ""}`.trim()
    : user?.email?.split("@")[0] ?? "";

  const initials = displayName
    ? displayName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("")
    : "U";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  async function handleSignOut() {
    setUserMenuOpen(false);
    await performClientSignOut();
    router.refresh();
  }

  return (
    <header>
      <div className="bg-salmon-soft pb-px">
        <div className="shell">
          <p className="py-2 text-center font-fredoka text-[13px] font-medium leading-5 text-ink sm:py-0 sm:text-[18px] sm:leading-[52px]">
            <span aria-hidden="true">🔥</span> Flat 50% OFF on Everything!
            <span className="block sm:inline"> Hurry, Sale Ending Soon.</span>
          </p>
        </div>
      </div>

      <div className="bg-white">
        <div className="shell flex h-[64px] items-center justify-between gap-3 sm:h-[72px] sm:gap-4 lg:h-[104px]">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex size-10 shrink-0 items-center justify-center text-ink sm:size-11 lg:hidden"
          >
            <MenuIcon className="size-6" />
          </button>

          <SiteSearch
            variant="desktop"
            className="hidden w-[285px] shrink-0 lg:block"
          />

          <Link
            href="/"
            className="mx-auto min-w-0 shrink sm:mx-0"
            aria-label="Babies Bloomers home"
          >
            <Image
              src={branding.logo}
              alt="Babies Bloomers"
              width={842}
              height={180}
              priority
              className="h-[36px] w-auto max-w-[160px] object-contain sm:h-[44px] sm:max-w-none lg:h-[64px]"
              unoptimized={branding.logo.startsWith("http")}
            />
          </Link>

          <div className="flex shrink-0 items-center gap-2 text-ink sm:gap-[15px] lg:gap-[30px]">
            <Link
              href="/compare"
              aria-label={
                compareBadge > 0 ? `Compare, ${compareBadge}` : "Compare"
              }
              className="relative hidden size-10 items-center justify-center transition-colors hover:text-salmon sm:flex"
            >
              <CompareIcon className="size-6" />
              {compareBadge > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-0 flex size-[18px] items-center justify-center rounded-full bg-salmon-soft text-[10px] font-semibold leading-none text-white"
                >
                  {compareBadge > 99 ? "99+" : compareBadge}
                </span>
              ) : null}
            </Link>
            <Link
              href="/wishlist"
              aria-label={
                wishlistBadge > 0 ? `Wishlist, ${wishlistBadge}` : "Wishlist"
              }
              className="relative hidden size-10 items-center justify-center transition-colors hover:text-salmon sm:flex"
            >
              <HeartIcon className="size-6" />
              {wishlistBadge > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-0 flex size-[18px] items-center justify-center rounded-full bg-salmon-soft text-[10px] font-semibold leading-none text-white"
                >
                  {wishlistBadge > 99 ? "99+" : wishlistBadge}
                </span>
              ) : null}
            </Link>

            {/* Auth section */}
            {!initialized ? (
              /* Skeleton */
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-8 w-16 animate-pulse rounded-full bg-[#f0f0f0]" />
                <div className="h-8 w-20 animate-pulse rounded-full bg-[#f0f0f0]" />
              </div>
            ) : user ? (
              /* Logged in: avatar dropdown */
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 rounded-full border border-[#e8e8e8] px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-salmon hover:text-salmon"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-salmon text-[11px] font-bold text-white">
                    {initials}
                  </span>
                  <span className="max-w-[100px] truncate">{displayName}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#f0f0f0] bg-white shadow-xl">
                    <div className="border-b border-[#f5f5f5] px-4 py-3">
                      <p className="truncate font-poppins text-[12px] text-body">
                        {user.email}
                      </p>
                      {isStaff ? (
                        <span className="mt-1.5 inline-flex rounded-full bg-[#fff5f2] px-2 py-0.5 font-poppins text-[10px] font-semibold uppercase tracking-wide text-salmon">
                          {profile?.role === "shop_manager"
                            ? "Shop Manager"
                            : "Admin"}
                        </span>
                      ) : null}
                    </div>
                    {accountMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 font-poppins text-[13px] font-medium text-ink transition-colors hover:bg-[#fff5f2] hover:text-salmon"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-[#f5f5f5]">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full px-4 py-2.5 text-left font-poppins text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged out: Sign In + Sign Up */
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="flex h-9 items-center justify-center rounded-full border border-[#d6d6d6] px-4 font-poppins text-[13px] font-medium text-ink transition-colors hover:border-salmon hover:text-salmon"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="flex h-9 items-center justify-center rounded-full bg-salmon px-4 font-poppins text-[13px] font-semibold text-white transition-colors hover:bg-salmon-soft"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <Link
              href="/cart"
              aria-label={
                badgeCount > 0
                  ? `Cart, ${badgeCount} ${badgeCount === 1 ? "item" : "items"}`
                  : "Cart"
              }
              className="relative flex size-10 items-center justify-center transition-colors hover:text-salmon"
            >
              <BagIcon className="size-6" />
              {badgeCount > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-0 flex size-[18px] items-center justify-center rounded-full bg-salmon-soft text-[10px] font-semibold leading-none text-white"
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </div>

      <nav aria-label="Main" className="relative z-40 hidden bg-[#131b29] lg:block">
        <div className="shell">
          <ul className="flex items-center justify-center">
            {navLinks.map((link) => {
              if (link.label === "Categories") {
                return (
                  <CategoriesDesktopMegaMenu
                    key="categories"
                    active={pathname.startsWith("/categories")}
                  />
                );
              }
              const active = isActivePath(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`block px-[35px] py-5 font-poppins text-[20px] leading-[28px] text-white transition-colors hover:text-salmon ${
                      active ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-ink/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-ink px-6 py-6">
            <div className="mb-8 flex items-center justify-between">
              <Image
                src={branding.footerLogo}
                alt="Babies Bloomers"
                width={251}
                height={183}
                className="h-[52px] w-auto"
                unoptimized={branding.footerLogo.startsWith("http")}
              />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex size-11 items-center justify-center text-white"
              >
                <CloseIcon className="size-6" />
              </button>
            </div>

            <SiteSearch
              variant="mobile"
              className="mb-6"
              onNavigate={() => setMenuOpen(false)}
            />

            <ul className="flex flex-col">
              {navLinks.map((link) => {
                if (link.label === "Categories") {
                  return (
                    <CategoriesMobileAccordion
                      key="categories"
                      onNavigate={() => setMenuOpen(false)}
                    />
                  );
                }
                const active = isActivePath(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`block py-3 font-poppins text-[18px] leading-[28px] text-white ${
                        active ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ul className="mt-6 flex flex-col border-t border-white/15 pt-4">
              {user ? (
                <>
                  {isStaff ? (
                    <li className="mb-2">
                      <span className="inline-flex rounded-full bg-salmon/20 px-2.5 py-1 font-poppins text-[11px] font-semibold uppercase tracking-wide text-salmon">
                        {profile?.role === "shop_manager"
                          ? "Shop Manager"
                          : "Admin"}
                      </span>
                    </li>
                  ) : null}
                  {accountMenuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className="block py-3 font-poppins text-[16px] font-medium leading-[28px] text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); handleSignOut(); }}
                      className="block py-3 font-poppins text-[16px] font-medium leading-[28px] text-red-400"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/sign-in"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-3 font-poppins text-[16px] font-medium leading-[28px] text-white"
                    >
                      <UserIcon className="size-5" />
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sign-up"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 py-3 font-poppins text-[16px] font-medium leading-[28px] text-salmon"
                    >
                      Sign Up
                    </Link>
                  </li>
                  {[
                    { label: "Cart", href: "/cart", Icon: BagIcon },
                    { label: "Wishlist", href: "/wishlist", Icon: HeartIcon },
                    { label: "Compare", href: "/compare", Icon: CompareIcon },
                  ].map(({ label, href, Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 py-3 font-poppins text-[16px] font-medium leading-[28px] text-white"
                      >
                        <Icon className="size-5" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </header>
  );
}
