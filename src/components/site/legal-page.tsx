import type { ReactNode } from "react";
import type { LegalBlock, LegalPageContent } from "@/lib/site-data";

const EMAIL = "orders@babiesbloomers.com";

function withEmailLinks(text: string): ReactNode {
  if (!text.includes(EMAIL)) return text;

  const parts = text.split(EMAIL);
  return parts.reduce<ReactNode[]>((nodes, part, index) => {
    nodes.push(part);
    if (index < parts.length - 1) {
      nodes.push(
        <a
          key={`${EMAIL}-${index}`}
          href={`mailto:${EMAIL}`}
          className="text-body underline decoration-body/40 underline-offset-2 transition-colors hover:text-salmon hover:decoration-salmon"
        >
          {EMAIL}
        </a>,
      );
    }
    return nodes;
  }, []);
}

function Block({ block }: { block: LegalBlock }) {
  switch (block.type) {
    case "h3":
      return (
        <h3 className="mt-5 mb-5 font-poppins text-2xl font-medium leading-8 text-ink">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="mb-4 list-disc space-y-1 pl-6 font-poppins text-sm font-normal leading-6 text-body">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "updated":
      return (
        <p className="mt-6 font-poppins text-sm font-normal leading-6 text-body">
          {block.text}
        </p>
      );
    case "p":
    default:
      return (
        <p className="mb-4 font-poppins text-sm font-normal leading-6 text-body">
          {withEmailLinks(block.text)}
        </p>
      );
  }
}

/**
 * Plain legal/policy layout — matches the WP reference (no page banner).
 * Poppins headings + body, left-aligned column ~1093px.
 */
export function LegalPage({ page }: { page: LegalPageContent }) {
  return (
    <section className="bg-white py-[50px] max-[767px]:py-[35px] lg:py-[70px]">
      <div className="shell">
        <article className="max-w-[1093px]">
          <h1 className="mb-5 font-poppins text-[28px] font-semibold leading-tight text-ink sm:text-[36px] sm:leading-[1.3]">
            {page.title}
          </h1>
          {page.blocks.map((block, index) => (
            <Block key={`${block.type}-${index}`} block={block} />
          ))}
        </article>
      </div>
    </section>
  );
}
