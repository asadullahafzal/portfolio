import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { education, profile, site, skillGroups } from "@/data/profile";
import SmoothScroll from "@/components/motion/SmoothScroll";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: profile.name, url: site.url }],
  creator: profile.name,
  keywords: [
    "Asadullah Afzal",
    "Full-Stack Engineer",
    "SEO Expert",
    "AI Educator",
    "Next.js Developer",
    "MERN Stack Developer",
    "FAST-NUCES",
    "Pakistan",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    firstName: "Asadullah",
    lastName: "Afzal",
    images: [{ url: profile.photo, width: 1086, height: 1448, alt: profile.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [profile.photo],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05070f",
  colorScheme: "dark",
};

// Person structured data so Google understands who this site is about.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: site.url,
  image: `${site.url}${profile.photo}`,
  email: `mailto:${profile.email}`,
  jobTitle: profile.roles.join(", "),
  description: site.description,
  worksFor: { "@type": "Organization", name: "Dollar Tech", url: "https://thedollartech.tech" },
  alumniOf: { "@type": "CollegeOrUniversity", name: education.schoolFull },
  knowsAbout: skillGroups.flatMap((g) => g.skills),
  sameAs: [profile.socials.linkedin, profile.socials.github],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="min-h-svh">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
