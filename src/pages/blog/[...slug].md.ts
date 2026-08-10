import type { APIRoute, GetStaticPaths } from 'astro';
import { type CollectionEntry, getCollection } from 'astro:content';
import { parseDocument } from 'yaml';

import { ATTRIBUTION, markdownTwinRouteParam, postPagePath } from '@utils/markdownTwin';
import { mdxToMarkdown } from '@utils/mdxToMarkdown';

// The Markdown twin of every blog post, at `/blog/<slug>/index.md`. One endpoint file covers all of
// them: `getStaticPaths` appends `/index` to each post's id, and the rest parameter matches slashes,
// so the route generator yields the twin beside the `index.html` it mirrors.

const BLOG_ROOT = '../../content/blog/';

// The raw file rather than `entry.body`: the glob loader splits frontmatter from the body before the
// collection sees it, and the twin keeps the post's own frontmatter block.
const RAW_SOURCES = import.meta.glob<string>('../../content/blog/**/*.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
});

// Every image in the blog tree, so an identifier can be resolved to the URL Astro actually emits —
// the raw source cannot yield it, because Astro hashes and rewrites image filenames. The glob is
// also an import of each file, and that is what makes the base asset exist: without it a build
// emits only the hashed responsive variants a `<Picture>` renders, and the URL a twin links 404s.
const IMAGES = import.meta.glob<{ default: ImageMetadata }>(
    '../../content/blog/**/*.{png,jpg,jpeg,gif,svg,webp,avif}',
    { eager: true }
);

const imageUrls = new Map(
    Object.entries(IMAGES).map(([path, module]) => [path.slice(BLOG_ROOT.length), module.default.src])
);

// Resolve a source-relative specifier against the post's own directory. Images are not always in
// that directory: one post imports two of its diagrams from another post's folder.
const imageKey = (postId: string, specifier: string): string =>
    new URL(specifier, `file:///${postId}/`).pathname.slice(1);

const getStaticPaths: GetStaticPaths = async () => {
    const posts = await getCollection('blog');

    return posts.map((post) => ({
        params: { slug: markdownTwinRouteParam(post.id) },
        props: post
    }));
};

const GET: APIRoute<CollectionEntry<'blog'>> = ({ props: post, site }) => {
    const toUrl = (path: string): string => new URL(path, site).href;

    const source = RAW_SOURCES[`${BLOG_ROOT}${post.id}/index.mdx`];

    if (source === undefined) {
        throw new Error(`${post.id}: no MDX source found for the post.`);
    }

    const { frontmatter, body } = mdxToMarkdown(source, {
        slug: post.id,
        resolveImageUrl: (specifier) => {
            const url = imageUrls.get(imageKey(post.id, specifier));

            return url === undefined ? undefined : toUrl(url);
        }
    });

    // The post's own frontmatter block, with two fields edited rather than the whole block rebuilt:
    // titles and excerpts are free text that Astro already parses on every build, so passing them
    // through removes a class of escaping bug. `heroImage` is a repo-relative source path that
    // resolves to nothing for a detached reader, and `canonical` does not exist in the source.
    const document = parseDocument(frontmatter);

    document.set('heroImage', toUrl(post.data.heroImage.src));
    document.set('canonical', toUrl(postPagePath(post.id)));

    // No post body carries an H1 — the title lives in frontmatter and the page layout renders it —
    // so the twin adds one, or the article reaches an agent with a headless outline.
    const twin = `---\n${document.toString()}---\n\n# ${post.data.title}\n\n${body}\n\n${ATTRIBUTION}\n`;

    // For the dev server's benefit only. A prerendered endpoint writes just its body to `dist/`, so
    // the type a client actually sees comes from whichever platform serves the build, not from here.
    return new Response(twin, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
    });
};

export { GET, getStaticPaths };
