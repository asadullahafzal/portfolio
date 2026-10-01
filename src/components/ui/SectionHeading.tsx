import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";

type Props = { index: string; eyebrow: string; title: ReactNode; intro?: string };

export default function SectionHeading({ index, eyebrow, title, intro }: Props) {
  return (
    <Reveal className="mb-12 max-w-3xl sm:mb-16">
      <p className="eyebrow mb-4">
        <span className="text-faint">{index} /</span> {eyebrow}
      </p>
      <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{title}</h2>
      {intro && <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{intro}</p>}
    </Reveal>
  );
}
