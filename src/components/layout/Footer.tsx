import { profile } from "@/data/profile";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-faint sm:flex-row sm:px-16">
        <div className="text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} {profile.name}. Built with Next.js &amp; Three.js.
          </p>
          {/* Required by the model's CC BY 4.0 licence */}
          <p className="mt-1 text-xs">
            3D desk based on{" "}
            <a
              href="https://sketchfab.com/3d-models/gaming-desktop-pc-d1d8282c9916438091f11aeb28787b66"
              target="_blank"
              rel="noopener"
              className="underline underline-offset-2 transition hover:text-accent"
            >
              &ldquo;Gaming Desktop PC&rdquo;
            </a>{" "}
            by{" "}
            <a href="https://sketchfab.com/Yolala1232" target="_blank" rel="noopener" className="underline underline-offset-2 transition hover:text-accent">
              Yolala1232
            </a>
            , licensed under{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener" className="underline underline-offset-2 transition hover:text-accent">
              CC BY 4.0
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a href={profile.socials.github} target="_blank" rel="noopener" aria-label="GitHub" className="transition hover:text-accent">
            <GitHubIcon />
          </a>
          <a href={profile.socials.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" className="transition hover:text-accent">
            <LinkedInIcon />
          </a>
          <a href={`mailto:${profile.email}`} aria-label="Email" className="transition hover:text-accent">
            <MailIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
