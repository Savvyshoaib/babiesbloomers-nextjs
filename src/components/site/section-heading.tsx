import Image from "next/image";

type Align = "left" | "center" | "right";

const alignToItems: Record<Align, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};

export function SectionHeading({
  children,
  align = "center",
  separator,
  className = "",
  headingClassName = "",
}: {
  children: React.ReactNode;
  align?: Align;
  /** `pink` sits on light surfaces, `dark` on the salmon Dreamwear band. */
  separator?: "pink" | "dark";
  className?: string;
  headingClassName?: string;
}) {
  return (
    <div className={`flex flex-col ${alignToItems[align]} ${className}`}>
      <h2
        className={`font-fredoka font-medium text-ink text-[32px] leading-[38px] sm:text-[40px] sm:leading-[46px] lg:text-[48px] lg:leading-[52px] ${headingClassName}`}
      >
        {children}
      </h2>
      {separator ? (
        <Image
          src={separator === "pink" ? "/images/seprator-1.png" : "/images/seprator-2.png"}
          alt=""
          width={208}
          height={15}
          className="mt-[10px] h-[15px] w-[208px]"
        />
      ) : null}
    </div>
  );
}
