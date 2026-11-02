# karu studio

The karu studio website. Static, hand built, no page builder.

Live at [karu-studio.com](https://karu-studio.com) once the domain is pointed.
See `DEPLOY.md` for that part.

## What this is

- [Astro](https://astro.build) in TypeScript, one dependency, no UI framework
- Plain CSS, no Tailwind, no preprocessor
- Content in Markdown at `content/`, read through Astro content collections
- Deployed on Cloudflare Pages, every push to `main` goes live

The whole point is that two people can read this repo end to end. If something
here needs a plugin to understand, it is in the wrong place.

## Running it locally

You need Node 22 or newer. Check with `node -v`.

```bash
npm install
npm run dev
```

That serves the site at the URL printed in the terminal, usually
`http://localhost:4321`. Edits appear without a reload.

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Local dev server, drafts visible                     |
| `npm run build`   | Builds the live site into `dist/`, drafts excluded   |
| `npm run preview` | Serves `dist/` so you can check the real build       |
| `npm run check`   | Type checks the project and the content frontmatter  |

## Publishing a new project

One Markdown file. No layout code.

1. Copy `content/work/example-seed-announcement.md`
2. Rename it to the URL you want, for example `content/work/northbound-launch.md`
3. Fill in the frontmatter at the top and write the body underneath
4. Set `draft: false`
5. `git add`, `git commit`, `git push`

Cloudflare rebuilds on the push and the project is live in about a minute. The
landing page, the work index, the sitemap, and the RSS feed all pick it up on
their own. Set `featured: true` to pin it to the landing page.

Publishing a blog post or a note is the same flow in `content/writing/`.

`content/README.md` is the field guide: every frontmatter field, what it does,
whether it is required, and the image rules. Read that one before you write.

### Drafts

`draft: true` hides an entry from the live site but keeps it visible on the
local dev server. Useful for seeing how a piece will look before anyone else
can read it. Both example files ship as drafts, so a fresh deploy shows the
empty states rather than placeholder work.

## Where things are

```
content/            Markdown. Safe for the founders and their tools to edit.
  work/             Case studies and projects
  writing/          Blog posts and notes
  README.md         Frontmatter reference
public/             Files served as is
  images/work/      Project images
  _headers          Cloudflare caching and security headers
  _redirects        Cloudflare path redirects
src/
  content.config.ts The frontmatter schema. Edit to add a field.
  data/site.ts      Studio name, email, nav, social links
  data/services.ts  The five services and the process copy
  styles/tokens.css Every colour and typeface on the site. One file.
  styles/global.css Base styles, all reading from tokens
  layouts/          Page shell
  components/       Header, footer, index rows
  pages/            Routes. One file per URL.
DESIGN.md           The design brief and the open questions
DEPLOY.md           Cloudflare Pages and DNS, click by click
```

## Changing how it looks

Colour and type live in `src/styles/tokens.css` and nowhere else. Change a token
there and it changes everywhere, because no component hardcodes a hex code or a
font name. If you ever find one that does, that is a bug worth fixing.

`DESIGN.md` says what each decision is for and which decisions are still open.

## Voice rules

These are not style preferences, they are the argument the studio makes.

- No em dashes anywhere, in site copy or in these files
- No semicolons
- No marketing filler, no "elevate", no stacks of three adjectives
- Rephrase other people's writing rather than lifting it

## Deploying

A push to `main` triggers a Cloudflare Pages build. The settings Cloudflare
needs:

| Setting          | Value           |
| ---------------- | --------------- |
| Build command    | `npm run build` |
| Output directory | `dist`          |
| Node version     | `22`            |

Node 22 is pinned in `.nvmrc` and in `package.json`, so Cloudflare picks it up
without being told. `DEPLOY.md` has the dashboard steps and the DNS records.
