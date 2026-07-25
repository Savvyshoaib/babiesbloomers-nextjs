"use client";

import Image from "next/image";
import { useState } from "react";
import { newArrivals, newArrivalTabs, type NewArrivalTab } from "@/lib/site-data";
import { ArrivalCard } from "./product-card";
import { SectionHeading } from "./section-heading";

export function NewArrivals() {
  const [activeTab, setActiveTab] = useState<NewArrivalTab>("All");

  const products =
    activeTab === "All"
      ? newArrivals
      : newArrivals.filter((product) => product.tabs.includes(activeTab));

  return (
    <section
      className="mt-[80px] bg-no-repeat max-[1024px]:mt-[60px] max-[880px]:mt-[40px]"
      style={{
        backgroundImage:
          "url('/images/vector-1.png'), url('/images/vector-2.png')",
        backgroundPosition: "7% 93%, 95% 80%",
      }}
      aria-labelledby="new-arrivals-heading"
    >
      <div className="shell">
        <div className="grid gap-x-[30px] lg:grid-cols-[558fr_852fr]">
          <div className="lg:pt-[60px]">
            <SectionHeading
              align="center"
              separator="pink"
              className="lg:items-end"
              headingClassName="whitespace-nowrap"
            >
              <span id="new-arrivals-heading">New Arrivals</span>
            </SectionHeading>

            <Image
              src="/images/sample-image.jpg"
              alt="Two children wearing the new arrivals collection"
              width={558}
              height={654}
              sizes="(max-width: 1024px) 100vw, 558px"
              className="mt-[30px] h-auto w-full rounded-[15px] lg:mt-[40px]"
            />
          </div>

          <div className="mt-10 lg:mt-0">
            <div
              role="tablist"
              aria-label="Filter new arrivals"
              className="mb-[30px] flex flex-wrap items-center gap-[15px]"
            >
              {newArrivalTabs.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-[30px] px-[15px] py-[5px] font-poppins text-[16px] font-medium leading-6 transition-colors ${
                      isActive
                        ? "bg-salmon-soft text-white"
                        : "text-steel hover:bg-salmon-soft/15"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-[30px] gap-y-[20px] pb-[20px] sm:grid-cols-3">
                {products.map((product) => (
                  <ArrivalCard key={product.title} product={product} />
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-[16px] text-body">
                No products in this category yet. Try another filter.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
