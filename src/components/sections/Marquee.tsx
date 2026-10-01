import { skillGroups } from "@/data/profile";

// Infinite ribbon of every skill. The list is rendered twice so the loop is seamless.
export default function Marquee() {
  const skills = [...new Set(skillGroups.flatMap((g) => g.skills))];

  return (
    <div aria-hidden className="marquee relative overflow-hidden border-y border-line bg-surface/40 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />
      <div className="marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {skills.map((s) => (
              <li key={s} className="flex items-center gap-6 pr-6 font-display text-lg text-muted sm:text-xl">
                {s}
                <span className="text-primary">◆</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
