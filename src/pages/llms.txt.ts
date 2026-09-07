import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

import { SITE_METADATA } from '../consts';
import { ATTRIBUTION, markdownTwinPath } from '../utils/markdownTwin';

// A Markdown map of the site for language models, following the llms.txt convention
// (https://llmstxt.org): an H1 name, a blockquote summary, free prose, then sections of links.
const SUMMARY =
    'Personal website and blog of Tamas Mezei, a software engineer and architect in Zurich, Switzerland. Writing on software, engineering culture, coding conventions, and cloud infrastructure. No ads, no trackers.';

export const GET: APIRoute = async ({ site }) => {
    const toUrl = (path: string): string => new URL(path, site).href;

    const posts = (await getCollection('blog')).sort(
        (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
    );

    const body = [
        `# ${SITE_METADATA.TITLE}`,
        '',
        `> ${SUMMARY}`,
        '',
        ATTRIBUTION,
        '',
        '## Pages',
        '',
        // These three link the pages themselves: they have no Markdown twin to point at. About is
        // hand-authored markup with no Markdown source, and Home and Blog are link lists.
        `- [Home](${toUrl('/')}): Latest posts and a short introduction.`,
        `- [About](${toUrl('/about')}): Who Tamas is and what he works on.`,
        `- [Blog](${toUrl('/blog')}): Every post, newest first.`,
        '',
        '## Blog posts',
        '',
        // The spec is explicit that the links in an llms.txt file should lead to LLM-friendly
        // content, so each post is listed by its twin. The twin names its own `canonical`, so an
        // agent that needs the human page is one hop away.
        ...posts.map((post) => `- [${post.data.title}](${toUrl(markdownTwinPath(post.id))}): ${post.data.excerpt}`),
        '',
        '## Optional',
        '',
        `- [RSS feed](${toUrl('/rss.xml')}): The same posts as a feed.`,
        `- [Sitemap](${toUrl('/sitemap-index.xml')}): Every indexable URL on the site.`,
        ''
    ].join('\n');

    return new Response(body, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
};
