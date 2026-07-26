"use client";

import { useAppSelector } from "@/store/hooks";
import { selectSiteContent } from "@/store/site-content-slice";

export function Vision() {
  const { vision } = useAppSelector(selectSiteContent);

  return (
    <section
      className="mb-[80px] bg-salmon py-[50px] sm:py-[80px] max-[880px]:mb-[50px]"
      aria-labelledby="vision-heading"
    >
      <div className="shell">
        <div className="mx-auto max-w-[1425px]">
          <h2
            id="vision-heading"
            className="text-center font-fredoka text-[28px] font-medium leading-[34px] text-ink sm:text-[40px] lg:text-[48px] lg:leading-[52px]"
          >
            {vision.title}
          </h2>
          <p className="mt-5 text-center font-poppins text-[14px] leading-6 text-vision sm:mt-[30px] px-1">
            {vision.body}
          </p>
        </div>
      </div>
    </section>
  );
}
