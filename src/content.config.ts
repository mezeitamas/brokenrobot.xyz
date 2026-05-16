import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const blog = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            excerpt: z.string(),
            publishDate: z
                .string()
                .or(z.date())
                .transform((val) => new Date(val)),
            heroImage: image(),
            tags: z.array(z.string())
        })
});

export const collections = { blog };
