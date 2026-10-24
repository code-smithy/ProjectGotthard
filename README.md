# Project Gotthard — The Gotthard Files

The public development blog for **Project Gotthard**, an independent science-fiction command and management game set in an alternate 1994. Astro 7, strict TypeScript, Markdown content collections and CSS. Fully static; no accounts, database, tracking, remote fonts or UI framework.

## Run locally

Use Node.js 24 LTS (minimum 22.23.4) and npm:

```sh
npm ci
npm run dev
npm run check
npm run build
npm test
npm run preview
```

The local address uses the root path `/`, matching the custom domain. `npm run verify` runs check, build and tests. Tests additionally build draft/spoiler/future fixtures at root and project base, reject malformed metadata and validate generated links. Fixtures are removed after testing. Do not edit content or run another Astro build concurrently with tests.

## Write a report

Add a Markdown file to `src/content/posts/`. Its filename becomes the permanent URL: use lower-case words separated by hyphens and keep published filenames stable.

```yaml
---
title: "Development Report: Your title"
description: "A clear summary between 30 and 240 characters for the archive and feed."
pubDate: 2026-10-24
tags: [development, design]
type: devlog
draft: true
spoilerLevel: none
---
```

Write the article underneath. Tags: `development`, `design`, `setting`, `art`, `technical`. Types: `devlog`, `technical`, `art`, `announcement`, `field-report`. Optional fields: `author`, `updatedDate`, `heroImage`, `heroAlt` (required with an image). Level-two headings build the article's table of contents.

Review text, images and links before setting `draft: false`. Drafts, future-dated posts and posts marked `spoilerLevel: major` are excluded from every page, archive, RSS and sitemap, including previews. A major spoiler requires deliberate editorial review and a metadata change; there is no automatic override. Minor spoilers receive an article label. Future posts need a rebuild on or after their publication date.

**Privacy:** This repository is exclusively for approved public material. Never add internal game-source links, repository names, secrets or unreleased lore. Draft filtering protects generated output, not source history. Sensitive material must stay outside this source tree and `public/`; everything in `public/` is copied verbatim. There is no source-repository CTA or automatic content sync.

The three launch articles are editorial introductions based on the approved public premise. They describe intentions, not verified shipped features. Review wording and dates before launch. No screenshots were supplied. The original inline SVG Alpine schematic is labelled website artwork; no third-party visual assets are used.

## Structure

- `src/pages/`: landing page, about, devlog, articles, tags, media, roadmap, RSS, robots and 404.
- `src/content.config.ts`: metadata validation.
- `src/lib/posts.ts`: shared publication boundary, newest-first sorting and filename tie-breaker.
- `src/lib/urls.ts`: base-aware URLs.
- `src/data/links.ts`: optional approved community/store URLs; missing destinations are omitted.
- `src/data/roadmap.ts`: public editorial priorities, with no unverified game completion claims.
- `src/styles/`: palette, typography and responsive layouts.
- `tests/build.test.mjs`: generated-output and publishing-boundary checks.

The archive has progressive search over titles, descriptions and topics. Articles and topic navigation work without JavaScript. Pagination is deferred while there are three posts; add it before exceeding 12. Social metadata uses a text summary until an approved preview image exists.

## Images

Keep approved images in `src/assets/images/`. Reference a hero image relative to the Markdown file with descriptive `heroAlt`; Astro optimizes it. For body images, use meaningful Markdown alt text and captions identifying Screenshot, Work in Progress or Concept. Record creator, licence and source for added assets. Never represent illustration as gameplay.

## GitHub Pages

Defaults match the custom domain configured in GitHub Pages:

- `site`: `https://projectgotthard.com`
- `base`: `/`
- `public/CNAME`: `projectgotthard.com`

Override `SITE_URL` and `BASE_PATH` for another destination. To return to the default project Pages address, remove the custom domain in Pages, remove `public/CNAME`, set `SITE_URL` to `https://code-smithy.github.io` and `BASE_PATH` to `/ProjectGotthard`. Domain DNS must point to GitHub Pages and HTTPS must be provisioned by GitHub.

CI runs on PRs and pushes to `main` using `npm ci` and `npm run verify`. **Deploy public blog** publishes automatically on pushes to `main` and can also run manually from Actions. It uses the official Astro and Pages actions with write permissions limited to deployment. Pages must use **GitHub Actions** as its source. Only commit approved public content to `main`.

References: [Astro installation](https://docs.astro.build/en/install-and-setup/), [content collections](https://docs.astro.build/en/guides/content-collections/), [GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).
