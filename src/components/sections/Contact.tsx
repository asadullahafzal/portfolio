import { profile } from "@/data/profile";
import Reveal from "@/components/motion/Reveal";
import SplitHeading from "@/components/motion/SplitHeading";
import AskAIButton from "@/components/chat/AskAIButton";
import { DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/Icons";

// Phase 6 adds the contact form (→ n8n webhook → email) next to these links.
export default function Contact() {
  const links = [
    { href: `mailto:${profile.email}`, label: profile.email, Icon: MailIcon },
    { href: profile.socials.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    { href: profile.socials.github, label: "GitHub", Icon: GitHubIcon },
  ];

  return (
    <section id="contact" className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="card relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-80 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]" />
          </div>
          <p className="eyebrow mb-4">
            <span className="text-faint">06 /</span> Contact
          </p>
          <SplitHeading className="mx-auto max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Have a product to build, rank <span className="text-gradient">or automate?</span>
          </SplitHeading>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
            I&apos;m open to freelance projects and full-time roles. Tell me what you&apos;re working on.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href={`mailto:${profile.email}`} className="btn btn-primary">
              <MailIcon width={16} height={16} /> Email me
            </a>
            <a href={profile.cv} download className="btn btn-ghost">
              <DownloadIcon width={16} height={16} /> Download CV
            </a>
            <AskAIButton question="Is Asadullah available for hire?" />
          </div>

          <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
            {links.map(({ href, label, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener" : undefined}
                  className="inline-flex items-center gap-2 text-muted transition hover:text-accent"
                >
                  <Icon width={16} height={16} /> {label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
