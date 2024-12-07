import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
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
