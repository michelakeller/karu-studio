import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content lives in /content at the repo root, not inside /src, so that it
 * reads as a folder of writing rather than a folder of code. Michela and
 * her tools can open, edit, and add files there without touching anything
 * in src/.
 *
 * Adding a project means adding one Markdown file to content/work and
 * pushing. No layout code changes.
 */

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/work' }),
  schema: z.object({
    /** Short, specific. Shown as the case study headline. */
    title: z.string(),
    /** The company the work was for. */
    client: z.string(),
    /** Year the work shipped. Used for sorting and the index. */
    year: z.number().int().min(2000).max(2100),
    /** One or two sentences. Used on the index and in link previews. */
    summary: z.string(),
    /** Free strings. See serviceVocabulary in src/data/site.ts. */
    services: z.array(z.string()).default([]),
    /** Path under /public, for example /images/work/acme-cover.jpg */
    cover: z.string().optional(),
    /** Describe the image for anyone who cannot see it. */
    coverAlt: z.string().optional(),
    /** Public link to the film or post, if there is one. */
    link: z.string().url().optional(),
    /** One number that mattered, for example "+180% reply rate". */
    result: z.string().optional(),
    /** True pins the entry to the landing page. */
    featured: z.boolean().default(false),
    /** True keeps the entry out of every build. */
    draft: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/writing' }),
  schema: z.object({
    title: z.string(),
    /** One or two sentences. Shown on the index and in link previews. */
    description: z.string(),
    /** YYYY-MM-DD. Sorts the index, newest first. */
    publishedAt: z.coerce.date(),
    /** Who wrote it. Defaults to the studio. */
    author: z.string().default('karu studio'),
    tags: z.array(z.string()).default([]),
    /** Set this if the piece was published somewhere else first. */
    canonical: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, writing };
