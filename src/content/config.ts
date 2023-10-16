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
            heroImage: image().refine((img) => img.width >= 1280, {
                message: 'Cover image must be at least 1280 pixels wide!'
            }),
            tags: z.array(z.string())
        })
});

export const collections = { blog };
