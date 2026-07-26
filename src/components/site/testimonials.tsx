"use client";

import Image from "next/image";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";
import { QuoteIcon } from "./icons";
import { SectionHeading } from "./section-heading";

export function Testimonials() {
  const { testimonials } = useAppSelector(selectSiteContent);
  const [active, setActive] = useState(0);
  const safeIndex = Math.min(active, Math.max(0, testimonials.length - 1));
  const current = testimonials[safeIndex];

  if (!current) return null;

  return (
    <section
      className="bleed-bg mt-[80px] bg-bottom pb-[80px] max-[880px]:mt-[40px] max-[880px]:pb-[40px]"
      style={{ backgroundImage: "url('/images/bg-testimonials.jpg')" }}
      aria-labelledby="testimonials-heading"
    >
      <div className="border-b-2 border-dashed border-[#d6d6d6]">
        <div className="shell">
          <SectionHeading align="center" separator="pink">
            <span id="testimonials-heading">Parents Love Babies Bloomers</span>
          </SectionHeading>

          <figure className="mt-[40px] flex flex-col items-center">
            <blockquote className="mx-auto w-full max-w-[936px] rounded-[15px] bg-salmon p-[25px] sm:p-[40px]">
              <QuoteIcon className="mx-auto h-[26px] w-[36px] text-white/60" />
              <p className="mt-[9px] text-center font-poppins text-[16px] leading-7 text-white">
                {current.quote}
              </p>
            </blockquote>

            <figcaption className="mt-[30px] text-center">
              <span className="block font-poppins text-[20px] font-medium leading-7 text-steel">
                {current.name}
              </span>
              <span className="block font-poppins text-[14px] font-medium leading-6 text-body">
                {current.role}
              </span>
            </figcaption>
          </figure>

          <div
            role="tablist"
            aria-label="Choose a review"
            className="mt-[10px] flex max-w-full flex-wrap items-end justify-center gap-3 overflow-x-auto px-1 sm:gap-[28px]"
          >
            {testimonials.map((testimonial, index) => {
              const isActive = index === safeIndex;
              return (
                <button
                  key={`${testimonial.name}-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Read the review from ${testimonial.name}`}
                  onClick={() => setActive(index)}
                  className={`shrink-0 cursor-pointer overflow-hidden rounded-full transition-all duration-300 ${
                    isActive
                      ? "size-[72px] opacity-100 sm:size-[100px]"
                      : "size-[52px] opacity-60 hover:opacity-90 sm:size-[70px]"
                  }`}
                >
                  <Image
                    src={testimonial.avatar}
                    alt=""
                    width={160}
                    height={160}
                    className="size-full object-cover"
                    unoptimized={testimonial.avatar.startsWith("http")}
                  />
                </button>
              );
            })}
          </div>

          <div
            aria-hidden="true"
            className="mx-auto mt-[15px] h-[5px] w-[70px] bg-salmon"
          />
        </div>
      </div>
    </section>
  );
}
