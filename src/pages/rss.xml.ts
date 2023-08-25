import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

import { SITE_METADATA } from '../consts';

const parser = new MarkdownIt();

export const GET: APIRoute = async ({ site }) => {
    const posts = await getCollection('blog');

    return rss({
        title: SITE_METADATA.TITLE,
        description: SITE_METADATA.DESCRIPTION,
        site: site !== undefined ? site : '',
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.publishDate,
            description: post.data.excerpt,
            content: sanitizeHtml(parser.render(post.body)),
            link: `/blog/${post.slug}`
        })),
        trailingSlash: false
    });
};
