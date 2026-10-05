import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="relative grid min-h-svh place-items-center overflow-hidden px-4 pt-16 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
      </div>
      <div>
        <p className="eyebrow mb-4">Error 404</p>
        <h1 className="font-display text-5xl font-bold tracking-tight sm:text-7xl">
          Lost in the <span className="text-gradient">network.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-muted">This page doesn&apos;t exist, but plenty of others do.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link href="/#projects" className="btn btn-ghost">
            See my projects
          </Link>
        </div>
      </div>
    </main>
  );
}
