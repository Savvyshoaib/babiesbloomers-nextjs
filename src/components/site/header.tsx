"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAppSelector } from "@/store/hooks";
import { navLinks } from "@/lib/site-data";
import { signOut } from "@/app/actions/auth";
import {
  BagIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const user = useAppSelector((s) => s.auth.user);
  const profile = useAppSelector((s) => s.auth.profile);
  const initialized = useAppSelector((s) => s.auth.initialized);

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
    await signOut();
    router.refresh();
  }

  return (
    <header>
      <div className="bg-salmon-soft pb-px">
        <div className="shell">
          <p className="text-center font-fredoka text-[14px] font-medium leading-[40px] text-ink sm:text-[18px] sm:leading-[52px]">
            <span aria-hidden="true">🔥</span> Flat 50% OFF on Everything! Hurry,
            Sale Ending Soon.
          </p>
        </div>
      </div>

      <div className="bg-white">
        <div className="shell flex h-[72px] items-center justify-between gap-4 lg:h-[104px]">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex size-11 shrink-0 items-center justify-center text-ink lg:hidden"
          >
            <MenuIcon className="size-6" />
          </button>

          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="hidden h-[42px] w-[285px] shrink-0 items-center rounded-[20px] border border-dashed border-[#d6d6d6] bg-white lg:flex"
          >
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              id="site-search"
              type="search"
              placeholder="Enter key to search"
              className="h-full min-w-0 flex-1 rounded-l-[20px] bg-transparent px-[15px] text-[14px] text-body placeholder:text-body focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-full w-[50px] shrink-0 items-center justify-center rounded-r-[20px] text-[#454545]"
            >
              <SearchIcon className="size-[18px]" />
            </button>
          </form>

          <Link href="/" className="shrink-0" aria-label="Babies Bloomers home">
            <Image
              src="/images/logo.png"
              alt="Babies Bloomers"
              width={842}
              height={180}
              priority
              className="h-[44px] w-auto lg:h-[64px]"
            />
          </Link>

          <div className="flex shrink-0 items-center gap-[15px] text-ink lg:gap-[30px]">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden size-10 items-center justify-center transition-colors hover:text-salmon sm:flex"
            >
              <HeartIcon className="size-6" />
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
                  <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#f0f0f0] bg-white shadow-xl">
                    <div className="border-b border-[#f5f5f5] px-4 py-3">
                      <p className="truncate font-poppins text-[12px] text-body">
                        {user.email}
                      </p>
                    </div>
                    {[
                      { label: "Dashboard", href: "/account" },
                      { label: "My Orders", href: "/account/orders" },
                      { label: "Invoices", href: "/account/invoices" },
                      { label: "Settings", href: "/account/settings" },
                    ].map((item) => (
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

      <nav aria-label="Main" className="hidden bg-[#131b29] lg:block">
        <div className="shell">
          <ul className="flex items-center justify-center">
            {navLinks.map((link) => {
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
                src="/images/footer-logo.png"
                alt="Babies Bloomers"
                width={251}
                height={183}
                className="h-[52px] w-auto"
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

            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="mb-6 flex h-10 items-center rounded-[20px] bg-white"
            >
              <label htmlFor="mobile-search" className="sr-only">
                Search products
              </label>
              <input
                id="mobile-search"
                type="search"
                placeholder="Enter key to search"
                className="h-full min-w-0 flex-1 bg-transparent px-[15px] text-[14px] text-body placeholder:text-body focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="flex size-10 items-center justify-center text-ink"
              >
                <SearchIcon className="size-[18px]" />
              </button>
            </form>

            <ul className="flex flex-col">
              {navLinks.map((link) => {
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
                  {[
                    { label: "Dashboard", href: "/account" },
                    { label: "My Orders", href: "/account/orders" },
                    { label: "Invoices", href: "/account/invoices" },
                    { label: "Settings", href: "/account/settings" },
                  ].map((item) => (
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
