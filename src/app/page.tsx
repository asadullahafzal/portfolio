import { site } from "@/data/profile";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import AILab from "@/components/sections/AILab";
import Contact from "@/components/sections/Contact";
import Marquee from "@/components/sections/Marquee";
import LatestPosts from "@/components/sections/LatestPosts";

// Tells Google this page is the profile of the Person defined in the root layout
const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: site.url,
  mainEntity: { "@id": `${site.url}/#person` },
  dateModified: new Date().toISOString(),
};

export default function Home() {
  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <About />
      <Skills />
      <Marquee />
      <Experience />
      <Projects />
      <AILab />
      <LatestPosts />
      <Contact />
    </main>
  );
}
