import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineCollection } from 'astro:content';

const blog = defineCollection({
    loader: glob({ pattern: ['**/[^_]*.{md,mdx}', '!**/tldr/**'], base: './src/content/blog' }),
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

// A post's TL;DR lives beside it at `<slug>/tldr/index.mdx` and takes all its metadata from the post,
// so it declares none.
const tldr = defineCollection({
    loader: glob({ pattern: '*/tldr/index.mdx', base: './src/content/blog' }),
    schema: z.object({}).strict()
});

export const collections = { blog, tldr };
