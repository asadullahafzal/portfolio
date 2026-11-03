import { skillGroups } from "@/data/profile";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import SkillsNetwork from "./SkillsNetwork";

export default function Skills() {
  return (
    <section id="skills" className="relative scroll-mt-16 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-16">
        <SectionHeading
          eyebrow="What I work with"
          title="Skills."
          intro="Full-stack engineering sits at the center, connected to SEO, AI, data and ad-tech. That's what lets me take a product from idea to revenue."
        />
        <Reveal>
          <SkillsNetwork groups={skillGroups} />
        </Reveal>
      </div>
    </section>
  );
}
