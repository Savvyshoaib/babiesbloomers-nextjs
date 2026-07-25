import Link from "next/link";
import { ChevronRightIcon } from "./icons";

type Crumb = { label: string; href?: string };

type PageBannerProps = {
  title: string;
  crumbs: Crumb[];
};

/**
 * Shared archive / inner-page title band. The reference uses a grey-blue fill
 * (`--bzo-main-color2-mix`) with the breadcrumbs artwork (bear + rainbow +
 * soft wave) centred as a 1920×211 decoration.
 */
export function PageBanner({ title, crumbs }: PageBannerProps) {
  return (
    <section
      className="bg-[#b8bbbf] bg-center bg-no-repeat py-[50px] max-[1200px]:py-[60px] max-[880px]:pb-[50px] max-[880px]:pt-10 max-[767px]:py-10 min-[1367px]:bg-scroll"
      style={{
        backgroundImage: "url('/images/breadcrumbs-bg-img.png')",
        backgroundSize: "1920px auto",
      }}
      aria-label={title}
    >
      <div className="shell">
        <div className="flex flex-col items-center gap-[10px] max-[880px]:gap-[5px]">
          <h1 className="text-center font-fredoka text-[32px] font-medium capitalize leading-10 text-[#111] sm:text-[38px] sm:leading-[46px] lg:text-[48px] lg:leading-[52px] xl:text-[60px] xl:leading-[68px]">
            {title}
          </h1>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center justify-center gap-[10px] font-poppins text-[16px] font-normal leading-6 text-body">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-[10px]">
                    {index > 0 ? (
                      <ChevronRightIcon className="size-[14px] shrink-0 text-body" />
                    ) : null}
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="transition-colors hover:text-salmon"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        aria-current={isLast ? "page" : undefined}
                        className={isLast ? "text-salmon" : undefined}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
