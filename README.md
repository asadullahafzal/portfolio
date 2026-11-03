# asadullahafzal.com

Personal portfolio of **Asadullah Afzal**: Full-Stack Engineer, SEO Expert and AI Educator.

**Live:** [asadullahafzal.com](https://asadullahafzal.com)

## Highlights

- **3D desk hero** with React Three Fiber: a realistic gaming-PC model (compressed 15 MB → 1.4 MB) whose monitor types out live code, plus an added vertical monitor replaying the deploy log; instant poster images on phones
- **Scroll animations** with GSAP (ScrollTrigger, SplitText) and Lenis smooth scrolling
- **"Ask my AI" assistant** that answers questions about my work entirely in the browser: typo-tolerant intent matching, project/skill detection and follow-ups, no API key needed
- **Case-study pages** for each featured project, statically generated
- **Blog** written in Markdown: syntax highlighting, table of contents, per-post share images, RSS, BlogPosting schema
- **SEO-first:** Person / CreativeWork / Breadcrumb structured data, sitemap, Open Graph, fast Core Web Vitals
- **Accessible:** keyboard friendly, reduced-motion support, semantic landmarks
- **Self-hosted** on a VPS: systemd service behind Caddy with automatic HTTPS, one-command deploys with automatic rollback

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Three.js · React Three Fiber · GSAP · Lenis · Caddy · systemd

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. All site content lives in [`src/data/profile.ts`](src/data/profile.ts).

## Writing a blog post

Add a Markdown file to `content/blog/`, e.g. `content/blog/my-new-post.md`:

```markdown
---
title: "My new post"
description: "One or two sentences. Shown on Google and in share cards."
date: 2026-10-20
tags: [Next.js, SEO]
draft: false   # true = only visible in local development
---

Write the post in Markdown. Code blocks are syntax-highlighted.
```

The URL is the file name (`/blog/my-new-post`). It's added to the blog, the home page, the
sitemap and the RSS feed automatically, with its own share image. Commit, push and deploy.

## Deploy

See [DEPLOY.md](DEPLOY.md).

## Credits

3D desk based on ["Gaming Desktop PC"](https://sketchfab.com/3d-models/gaming-desktop-pc-d1d8282c9916438091f11aeb28787b66) by [Yolala1232](https://sketchfab.com/Yolala1232), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Design inspired by [ladunjexa/reactjs18-3d-portfolio](https://github.com/ladunjexa/reactjs18-3d-portfolio) (MIT).
