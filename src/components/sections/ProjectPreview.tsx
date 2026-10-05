import type { Project } from "@/data/profile";
import ParallaxImage from "@/components/motion/ParallaxImage";

// Browser-window frame around a project: a real screenshot when we have one,
// otherwise a designed illustration of what the tool does.
export default function ProjectPreview({ project }: { project: Project }) {
  const host = project.url ? new URL(project.url).hostname : project.name;

  return (
    <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[0_30px_80px_-30px_rgb(47_123_255/0.45)]">
      <div className="flex items-center gap-3 border-b border-line bg-surface-2/80 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        </span>
        <span className="flex-1 truncate rounded-md bg-bg/60 px-3 py-1 text-center font-mono text-[11px] text-muted">{host}</span>
      </div>

      {project.image ? (
        <ParallaxImage
          src={project.image}
          alt={`${project.name} homepage`}
          sizes="(min-width: 1024px) 560px, 92vw"
          className="aspect-[16/10]"
        />
      ) : project.preview === "queries" ? (
        <QueriesIllustration />
      ) : (
        <GeneratorIllustration />
      )}
    </div>
  );
}

// The grid's fade-out mask must sit on its own layer, or it fades the content too
function GridBackdrop() {
  return <div aria-hidden className="bg-grid absolute inset-0 opacity-70" />;
}

// Query Finder: forum questions being collected into keyword ideas
function QueriesIllustration() {
  const rows = [
    { q: "how do I start a blog with no audience?", src: "Reddit", score: "Low KD" },
    { q: "best free tools for keyword research?", src: "Forum", score: "Low KD" },
    { q: "why is my new site not getting traffic?", src: "Reddit", score: "Med KD" },
    { q: "is adsense still worth it for small blogs?", src: "Reddit", score: "Low KD" },
  ];
  return (
    <div aria-label="Illustration of Query Finder collecting forum questions" role="img" className="relative flex aspect-[16/10] flex-col justify-center p-5 sm:p-7">
      <GridBackdrop />
      <div className="relative flex items-center gap-2 rounded-xl border border-line-strong bg-bg/80 px-4 py-3">
        <span className="size-2 animate-pulse rounded-full bg-accent" />
        <span className="font-mono text-xs text-muted sm:text-sm">scraping forums for “blogging”…</span>
      </div>
      <ul className="relative mt-4 space-y-2">
        {rows.map((r) => (
          <li key={r.q} className="flex items-center gap-3 rounded-lg border border-line bg-surface/90 px-3 py-2.5">
            <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary-soft">{r.src}</span>
            <span className="flex-1 truncate text-xs text-ink sm:text-sm">{r.q}</span>
            <span className="hidden shrink-0 font-mono text-[10px] text-accent sm:block">{r.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Puns Now: a generator turning a topic into puns
function GeneratorIllustration() {
  return (
    <div aria-label="Illustration of the Puns Now generator" role="img" className="relative flex aspect-[16/10] flex-col justify-center p-5 sm:p-7">
      <GridBackdrop />
      <p className="relative font-mono text-[11px] uppercase tracking-widest text-accent">Pun Generator</p>
      <div className="relative mt-3 flex gap-2">
        <span className="flex-1 rounded-xl border border-line-strong bg-bg/80 px-4 py-3 text-sm text-ink">pizza</span>
        <span className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Generate</span>
      </div>
      <ul className="relative mt-4 space-y-2 text-xs text-ink sm:text-sm">
        {["You've got a pizza my heart.", "I'm on a pizza diet. I just eat it on the side.", "Slice to meet you!"].map((p) => (
          <li key={p} className="rounded-lg border border-line bg-surface/90 px-3 py-2.5">
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}
