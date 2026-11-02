import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { getWork, getWriting } from '../lib/content';

/** Hand rolled so the project keeps a single dependency. */
export const GET: APIRoute = async () => {
  const work = await getWork();
  const writing = await getWriting();

  const paths = [
    '/',
    '/work',
    '/writing',
    ...work.map((entry) => `/work/${entry.id}`),
    ...writing.map((entry) => `/writing/${entry.id}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${site.url}${path}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
