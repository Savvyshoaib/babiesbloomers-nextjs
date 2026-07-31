"use client";

import Image from "next/image";
import Link from "next/link";
import { footerLinks } from "@/lib/site-data";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";
import { TrustBadges } from "./trust-badges";
import {
  FacebookIcon,
  InstagramIcon,
  LocationIcon,
  MailIcon,
  PhoneIcon,
  PinterestIcon,
  TwitterIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "./icons";

const socialIcons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  pinterest: PinterestIcon,
  twitter: TwitterIcon,
  youtube: YoutubeIcon,
  whatsapp: WhatsappIcon,
} as const;

const iconBtnClass =
  "flex size-10 items-center justify-center rounded-full bg-white text-pink-deep transition-transform hover:-translate-y-0.5";

export function Footer() {
  const { branding, socialLinks } = useAppSelector(selectSiteContent);
  const socials = socialLinks.filter((s) => s.enabled && s.href);

  return (
    <>
      <TrustBadges />
      <footer className="site-footer relative mt-[90px] overflow-x-clip bg-[#131b29] pt-[80px] max-[1200px]:pt-[60px] max-[767px]:mt-[60px] max-[767px]:pt-[56px]">
        <svg
          className="waves"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
            />
          </defs>
          <g className="parallax1">
            <use href="#gentle-wave" x="48" y="0" />
          </g>
          <g className="parallax2">
            <use href="#gentle-wave" x="48" y="3" />
          </g>
          <g className="parallax3">
            <use href="#gentle-wave" x="48" y="6" />
          </g>
          <g className="parallax4">
            <use href="#gentle-wave" x="48" y="9" />
          </g>
        </svg>

        <div className="shell relative z-10">
          <div className="flex flex-col items-center">
            <Link
              href="/"
              aria-label="Babies Bloomers home"
              className="relative mx-auto block w-full max-w-[200px] sm:max-w-[251px]"
            >
              <Image
                src={branding.footerLogo}
                alt="Babies Bloomers"
                width={251}
                height={183}
                className="mx-auto h-auto w-full max-h-[88px] object-contain object-center mix-blend-lighten sm:max-h-[126px]"
                unoptimized={branding.footerLogo.startsWith("http")}
              />
            </Link>

            <p className="mt-6 text-center font-poppins text-[14px] font-medium leading-6 text-white/80 sm:mt-[30px] sm:text-[16px]">
              Sign up to get the latest on sales, new releases and more
            </p>

            <nav aria-label="Footer" className="mt-8 lg:mt-[65px]">
              <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-[26px] sm:gap-y-3">
                <li aria-hidden="true" className="hidden lg:block">
                  <Image src="/images/line.png" alt="" width={48} height={6} />
                </li>
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-poppins text-[13px] font-semibold uppercase leading-6 text-white/75 transition-colors hover:text-salmon sm:text-[18px] sm:leading-[30px] lg:text-[20px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li aria-hidden="true" className="hidden lg:block">
                  <Image src="/images/line.png" alt="" width={48} height={6} />
                </li>
              </ul>
            </nav>

            <ul className="mt-8 flex flex-wrap items-center justify-center gap-[15px] sm:mt-[40px]">
              {socials.map(({ id, network, href }) => {
                const Icon = socialIcons[network];
                if (!Icon) return null;
                return (
                  <li key={id}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={network}
                      className={iconBtnClass}
                    >
                      <Icon className="size-5" />
                    </a>
                  </li>
                );
              })}
              <li>
                <a
                  href="tel:+923281650622"
                  aria-label="Call +92 328 1650622"
                  className={iconBtnClass}
                >
                  <PhoneIcon className="size-5" />
                </a>
              </li>
              <li>
                <a
                  href="mailto:orders@babiesbloomers.com"
                  aria-label="Email orders@babiesbloomers.com"
                  className={iconBtnClass}
                >
                  <MailIcon className="size-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1560px] px-[15px] lg:px-[45px]">
          <div className="mt-8 border-t-2 border-dotted border-white/25 py-5 sm:mt-[40px]">
            <div className="flex flex-col items-center gap-3 text-center font-poppins text-[13px] leading-6 text-white/70 sm:text-[14px] lg:flex-row lg:justify-between lg:text-left">
              <p className="flex items-center gap-2">
                <LocationIcon className="size-4 shrink-0" />
                Karachi Pakistan
              </p>
              <p>
                &copy; Copyright {new Date().getFullYear()} Babies Bloomers.
                Designed By{" "}
                <a
                  href="https://appexcreative.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-white hover:underline"
                >
                  Appexcreative
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MailIcon className="size-4 shrink-0" />
                <a
                  href="mailto:orders@babiesbloomers.com"
                  className="hover:underline"
                >
                  orders@babiesbloomers.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
