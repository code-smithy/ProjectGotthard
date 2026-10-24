import { getCollection } from 'astro:content';
export async function publicPosts() {
  return (await getCollection('posts', ({ data }) =>
    !data.draft && data.spoilerLevel !== 'major' && data.pubDate <= new Date(),
  )).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id));
}
