import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";

type Props = { index: string; eyebrow: string; title: ReactNode; intro?: string };

export default function SectionHeading({ index, eyebrow, title, intro }: Props) {
  return (
    <div className="mb-12 max-w-3xl sm:mb-16">
      <Reveal>
        <p className="eyebrow mb-4">
          <span className="text-faint">{index} /</span> {eyebrow}
        </p>
      </Reveal>
      <SplitHeading className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
        {title}
      </SplitHeading>
      {intro && (
        <Reveal delay={0.15}>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
