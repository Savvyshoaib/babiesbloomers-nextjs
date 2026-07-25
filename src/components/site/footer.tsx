import Image from "next/image";
import Link from "next/link";
import { footerLinks } from "@/lib/site-data";
import {
  FacebookIcon,
  InstagramIcon,
  LocationIcon,
  MailIcon,
  PinterestIcon,
  TwitterIcon,
} from "./icons";

const socials = [
  { label: "Facebook", href: "https://facebook.com", Icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", Icon: InstagramIcon },
  { label: "Pinterest", href: "https://pinterest.com", Icon: PinterestIcon },
  { label: "Twitter", href: "https://twitter.com", Icon: TwitterIcon },
];

/**
 * The footer artwork supplies both the wave cut-out and the dark fill, so the
 * element must stay transparent — a background colour would fill the wave.
 */
export function Footer() {
  return (
    <footer
      className="mt-auto bg-auto bg-top bg-no-repeat pt-[70px] max-[1200px]:pt-[50px] max-[880px]:bg-cover max-[767px]:pt-[30px] min-[1921px]:bg-[length:100%_auto]"
      style={{ backgroundImage: "url('/images/bg-footer.png')" }}
    >
      <div className="shell">
        <div className="flex flex-col items-center">
          <Link href="/" aria-label="Babies Bloomers home">
            <Image
              src="/images/footer-logo.png"
              alt="Babies Bloomers"
              width={251}
              height={183}
              className="h-[126px] w-auto"
            />
          </Link>

          <p className="mt-[30px] text-center font-poppins text-[16px] font-medium leading-6 text-body">
            Sign up to get the latest on sales, new releases and more
          </p>

          <nav aria-label="Footer" className="mt-[40px] lg:mt-[65px]">
            <ul className="flex flex-wrap items-center justify-center gap-x-[26px] gap-y-3">
              <li aria-hidden="true" className="hidden lg:block">
                <Image src="/images/line.png" alt="" width={48} height={6} />
              </li>
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-poppins text-[20px] font-semibold uppercase leading-[30px] text-body transition-colors hover:text-salmon"
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

          <ul className="mt-[40px] flex items-center justify-center gap-[15px]">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full bg-white text-pink-deep transition-transform hover:-translate-y-0.5"
                >
                  <Icon className="size-5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The rule spans the full 1470px container, 15px wider than the content. */}
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
