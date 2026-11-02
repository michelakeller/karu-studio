import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { getWriting } from '../lib/content';

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Hand rolled so the project keeps a single dependency. */
export const GET: APIRoute = async () => {
  const entries = await getWriting();

  const items = entries
    .map(
      (entry) => `    <item>
      <title>${escape(entry.data.title)}</title>
      <link>${site.url}/writing/${entry.id}</link>
      <guid>${site.url}/writing/${entry.id}</guid>
      <pubDate>${entry.data.publishedAt.toUTCString()}</pubDate>
      <description>${escape(entry.data.description)}</description>
    </item>`,
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(site.name)} writing</title>
    <link>${site.url}/writing</link>
    <description>${escape(site.description)}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
