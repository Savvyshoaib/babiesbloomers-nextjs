"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";
import { resolvePhoneHref } from "@/lib/site-content-types";
import { CheckBadgeIcon, PhoneIcon } from "./icons";
import { SectionHeading } from "./section-heading";

export function Dreamwear() {
  const {
    backgroundImage,
    image,
    imageAlt,
    title,
    description,
    features,
    ctaLabel,
    ctaHref,
    phone,
    phoneHref,
    phoneLabel,
  } = useAppSelector(selectSiteContent).dreamwear;

  return (
    <section
      className="mt-[55px] bg-auto bg-top bg-no-repeat py-[50px] max-[1200px]:mt-[40px] max-[880px]:mt-[20px] max-[880px]:bg-cover min-[1921px]:bg-[length:100%_auto]"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
      aria-labelledby="dreamwear-heading"
    >
      <div className="mx-auto w-full max-w-[1465px] px-[15px] lg:px-[45px]">
        <div className="grid items-center gap-y-8 lg:grid-cols-[633fr_743fr]">
          <div className="flex justify-center">
            <Image
              src={image}
              alt={imageAlt}
              width={548}
              height={603}
              sizes="(max-width: 1024px) 90vw, 548px"
              className="h-auto w-full max-w-[548px]"
              unoptimized={image.startsWith("http")}
            />
          </div>

          <div className="lg:pl-[50px] lg:pr-[15px]">
            <SectionHeading
              align="center"
              separator="dark"
              className="lg:items-start"
              headingClassName="lg:text-left"
            >
              <span id="dreamwear-heading">{title}</span>
            </SectionHeading>

            <p className="pt-[15px] text-center font-poppins text-[14px] leading-6 text-ink lg:text-left">
              {description}
            </p>

            <ul className="mt-[28px] grid gap-3 sm:mt-[40px] sm:gap-5 sm:grid-cols-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 rounded-[10px] bg-white px-4 py-4 shadow-[0_1px_18px_0_rgba(0,0,0,0.12)] sm:py-[25px] sm:pl-5 sm:pr-[30px]"
                >
                  <CheckBadgeIcon className="size-7 shrink-0 text-pink sm:size-[33px]" />
                  <span className="font-poppins text-[15px] font-medium leading-6 text-body sm:text-[18px] sm:leading-7 lg:text-[22px]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-[40px] flex flex-wrap items-center justify-center gap-x-[40px] gap-y-6 lg:justify-start">
              <Link
                href={ctaHref || "/contact"}
                className="flex h-[49px] items-center rounded-[40px] bg-ink px-[25px] font-poppins text-[16px] font-semibold uppercase leading-6 text-white transition-opacity hover:opacity-90"
              >
                {ctaLabel || "Explore"}
              </Link>

              {phone ? (
                <div className="flex items-center gap-[10px]">
                  <span className="flex size-[49px] shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    <PhoneIcon className="size-6" />
                  </span>
                  <span>
                    <a
                      href={resolvePhoneHref(phone, phoneHref)}
                      className="block font-poppins text-[18px] font-medium leading-6 text-ink"
                    >
                      {phone}
                    </a>
                    {phoneLabel ? (
                      <span className="block font-poppins text-[12px] leading-4 text-ink/70">
                        {phoneLabel}
                      </span>
                    ) : null}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
