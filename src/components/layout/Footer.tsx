import { profile } from "@/data/profile";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-faint sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} {profile.name}. Built with Next.js &amp; Three.js.
        </p>
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
