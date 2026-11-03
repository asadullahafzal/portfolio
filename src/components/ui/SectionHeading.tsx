import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";

// Reference style: a small uppercase label above a big, heavy title.
// `index` is kept for compatibility but no longer shown.
type Props = { index?: string; eyebrow: string; title: ReactNode; intro?: string };

export default function SectionHeading({ eyebrow, title, intro }: Props) {
  return (
    <div className="mb-12 max-w-3xl sm:mb-16">
      <Reveal>
        <p className="eyebrow mb-2">{eyebrow}</p>
      </Reveal>
      <SplitHeading className="text-[30px] font-black leading-tight text-ink xs:text-[40px] sm:text-[50px] md:text-[60px]">
        {title}
      </SplitHeading>
      {intro && (
        <Reveal delay={0.15}>
          <p className="mt-4 max-w-3xl text-[17px] leading-[30px] text-muted">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
