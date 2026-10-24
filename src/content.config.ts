import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) => z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(30).max(240),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.enum(['development', 'design', 'setting', 'art', 'technical'])).min(1),
    draft: z.boolean().default(false),
    author: z.string().default('Project Gotthard'),
    type: z.enum(['devlog', 'technical', 'art', 'announcement', 'field-report']).default('devlog'),
    spoilerLevel: z.enum(['none', 'minor', 'major']).default('none'),
    heroImage: image().optional(),
    heroAlt: z.string().min(1).optional(),
  }).refine((post) => !post.heroImage || !!post.heroAlt, {
    message: 'A hero image requires descriptive heroAlt text.', path: ['heroAlt'],
  }),
});
export const collections = { posts };
