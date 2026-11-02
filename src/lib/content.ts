import { getCollection, type CollectionEntry } from 'astro:content';

const isPublished = ({ data }: { data: { draft: boolean } }) =>
  import.meta.env.DEV || data.draft === false;

/** Work entries, newest year first. Drafts are visible in dev only. */
export async function getWork(): Promise<CollectionEntry<'work'>[]> {
  const entries = await getCollection('work', isPublished);
  return entries.sort(
    (a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title),
  );
}

/** Writing entries, newest first. Drafts are visible in dev only. */
export async function getWriting(): Promise<CollectionEntry<'writing'>[]> {
  const entries = await getCollection('writing', isPublished);
  return entries.sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
