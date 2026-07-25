"use client";

import Image from "next/image";
import { useState } from "react";
import { testimonials } from "@/lib/site-data";
import { QuoteIcon } from "./icons";
import { SectionHeading } from "./section-heading";

export function Testimonials() {
  const [active, setActive] = useState(1);
  const current = testimonials[active];

  return (
    <section
      className="bleed-bg mt-[80px] bg-bottom pb-[80px] max-[880px]:mt-[40px] max-[880px]:pb-[40px]"
      style={{ backgroundImage: "url('/images/bg-testimonials.jpg')" }}
      aria-labelledby="testimonials-heading"
    >
      {/* The dashed rule runs edge to edge and the slider marker sits on it. */}
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
            className="mt-[10px] flex items-end justify-center gap-[28px]"
          >
            {testimonials.map((testimonial, index) => {
              const isActive = index === active;
              return (
                <button
                  key={testimonial.name}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Read the review from ${testimonial.name}`}
                  onClick={() => setActive(index)}
                  className={`overflow-hidden rounded-full transition-all duration-300 ${
                    isActive
                      ? "size-[100px] opacity-100"
                      : "size-[70px] opacity-60 hover:opacity-90"
                  }`}
                >
                  <Image
                    src={testimonial.avatar}
                    alt=""
                    width={160}
                    height={160}
                    className="size-full object-cover"
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
