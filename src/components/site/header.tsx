"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { navLinks } from "@/lib/site-data";
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
  const { itemCount, ready } = useCart();
  const badgeCount = ready ? itemCount : 0;
  const [menuOpen, setMenuOpen] = useState(false);

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
            <Link
              href="/my-account"
              aria-label="My account"
              className="hidden size-10 items-center justify-center transition-colors hover:text-salmon sm:flex"
            >
              <UserIcon className="size-6" />
            </Link>
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

            <ul className="mt-6 flex flex-col border-t border-white/15 pt-4 sm:hidden">
              {[
                { label: "Wishlist", href: "/wishlist", Icon: HeartIcon },
                { label: "My account", href: "/my-account", Icon: UserIcon },
                {
                  label: badgeCount > 0 ? `Cart (${badgeCount})` : "Cart",
                  href: "/cart",
                  Icon: BagIcon,
                },
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
            </ul>
          </div>
        </div>
      ) : null}
    </header>
  );
}
