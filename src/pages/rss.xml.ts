import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { publicPosts } from '../lib/posts';
import { path } from '../lib/urls';
export async function GET(context: APIContext) {
  return rss({
    title: 'The Gotthard Files',
    description: 'Development reports from Project Gotthard, an independent science-fiction command game.',
    site: new URL(path(), context.site!),
    items: (await publicPosts()).map(post => ({ title: post.data.title, description: post.data.description, pubDate: post.data.pubDate, link: path(`devlog/${post.id}/`), categories: post.data.tags })),
    customData: '<language>en-gb</language>',
  });
}
