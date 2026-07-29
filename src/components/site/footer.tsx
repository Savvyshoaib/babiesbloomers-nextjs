"use client";

import Image from "next/image";
import Link from "next/link";
import { footerLinks } from "@/lib/site-data";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";
import {
  FacebookIcon,
  InstagramIcon,
  LocationIcon,
  MailIcon,
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

/**
 * The footer artwork supplies both the wave cut-out and the dark fill, so the
 * element must stay transparent — a background colour would fill the wave.
 */
export function Footer() {
  const { branding, socialLinks } = useAppSelector(selectSiteContent);
  const socials = socialLinks.filter((s) => s.enabled && s.href);

  return (
    <footer
      className="relative mt-[90px] bg-auto bg-top bg-no-repeat pt-[70px] max-[1200px]:pt-[50px] max-[880px]:bg-cover max-[767px]:pt-[30px] min-[1921px]:bg-[length:100%_auto]"
      style={{ backgroundImage: "url('/images/bg-footer.png')" }}
    >
      <svg
className="waves"
xmlns="http://www.w3.org/2000/svg"
viewBox="0 24 150 28"
preserveAspectRatio="none">

<defs>

<path
id="gentle-wave"
d="M-160 44
c30 0
58-18 88-18
s58 18 88 18
58-18 88-18
58 18 88 18
v44h-352z"/>

</defs>

<g className="parallax1">
<use href="#gentle-wave" x="48" y="0"></use>
</g>

<g className="parallax2">
<use href="#gentle-wave" x="48" y="3"></use>
</g>

<g className="parallax3">
<use href="#gentle-wave" x="48" y="6"></use>
</g>

<g className="parallax4">
<use href="#gentle-wave" x="48" y="9"></use>
</g>

</svg>

      <div className="shell">
        <div className="flex flex-col items-center">
          <Link href="/" aria-label="Babies Bloomers home">
            <Image
              src={branding.footerLogo}
              alt="Babies Bloomers"
              width={251}
              height={183}
              className="h-[100px] w-auto sm:h-[126px]"
              unoptimized={branding.footerLogo.startsWith("http")}
            />
          </Link>

          <p className="mt-[30px] text-center font-poppins text-[16px] font-medium leading-6 text-body">
            Sign up to get the latest on sales, new releases and more
          </p>

          <nav aria-label="Footer" className="mt-[32px] lg:mt-[65px]">
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-[26px] sm:gap-y-3">
              <li aria-hidden="true" className="hidden lg:block">
                <Image src="/images/line.png" alt="" width={48} height={6} />
              </li>
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-poppins text-[14px] font-semibold uppercase leading-6 text-body transition-colors hover:text-salmon sm:text-[18px] sm:leading-[30px] lg:text-[20px]"
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

          <ul className="mt-[40px] flex flex-wrap items-center justify-center gap-[15px]">
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
                    className="flex size-10 items-center justify-center rounded-full bg-white text-pink-deep transition-transform hover:-translate-y-0.5"
                  >
                    <Icon className="size-5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1560px] px-[15px] lg:px-[45px]">
        <div className="mt-[40px] border-t-2 border-dotted border-[#d6d6d6]/40 py-[20px]">
          <div className="flex flex-col items-center gap-3 text-center font-poppins text-[14px] leading-6 text-body lg:flex-row lg:justify-between lg:text-left">
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
                className="text-steel hover:underline"
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
  );
}
