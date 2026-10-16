import type { APIRoute, GetStaticPaths } from 'astro';
import { type CollectionEntry, getCollection } from 'astro:content';
import { parseDocument } from 'yaml';

import {
    ATTRIBUTION,
    markdownTwinPath,
    markdownTwinRouteParam,
    postPagePath,
    tldrPagePath,
    tldrTwinPath,
    tldrTwinRouteParam
} from '@utils/markdownTwin';
import { mdxToMarkdown } from '@utils/mdxToMarkdown';
import { getPostsWithTldrs } from '@utils/tldr';

// The Markdown twin of every blog post, at `/blog/<slug>/index.md`, and of every TL;DR, at
// `/blog/<slug>/tldr/index.md`. One endpoint file covers all of them: `getStaticPaths` appends
// `/index` to each id, and the rest parameter matches slashes, so the route generator yields the twin
// beside the `index.html` it mirrors.

const BLOG_ROOT = '../../content/blog/';

// The raw file rather than `entry.body`: the glob loader splits frontmatter from the body before the
// collection sees it, and the twin keeps the post's own frontmatter block.
// Two named globs, so a post lookup can never return a TL;DR source.
const POST_SOURCES = import.meta.glob<string>('../../content/blog/*/index.mdx', {
    query: '?raw',
    import: 'default',
    eager: true
});

const TLDR_SOURCES = import.meta.glob<string>('../../content/blog/*/tldr/index.mdx', {
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

type Props =
    { kind: 'post'; post: CollectionEntry<'blog'>; hasTldr: boolean } | { kind: 'tldr'; post: CollectionEntry<'blog'> };

const getStaticPaths: GetStaticPaths = async () => {
    const [posts, tldrs] = await Promise.all([getCollection('blog'), getPostsWithTldrs()]);

    return [
        ...posts.map((post) => ({
            params: { slug: markdownTwinRouteParam(post.id) },
            props: { kind: 'post', post, hasTldr: tldrs.has(post.id) } satisfies Props
        })),
        ...posts
            .filter((post) => tldrs.has(post.id))
            .map((post) => ({
                params: { slug: tldrTwinRouteParam(post.id) },
                props: { kind: 'tldr', post } satisfies Props
            }))
    ];
};

const GET: APIRoute<Props> = ({ props, site }) => {
    const { post } = props;
    const toUrl = (path: string): string => new URL(path, site).href;
    const isTldr = props.kind === 'tldr';

    const source = isTldr
        ? TLDR_SOURCES[`${BLOG_ROOT}${post.id}/tldr/index.mdx`]
        : POST_SOURCES[`${BLOG_ROOT}${post.id}/index.mdx`];

    if (source === undefined) {
        throw new Error(`${post.id}: no MDX source found for the ${isTldr ? 'TL;DR' : 'post'}.`);
    }

    // A TL;DR's images resolve against its own folder, `<slug>/tldr/`.
    const folder = isTldr ? `${post.id}/tldr` : post.id;

    const { frontmatter, body } = mdxToMarkdown(source, {
        slug: folder,
        resolveImageUrl: (specifier) => {
            const url = imageUrls.get(imageKey(folder, specifier));

            return url === undefined ? undefined : toUrl(url);
        }
    });

    // A TL;DR has no frontmatter of its own, so it carries the post's block. A post cannot lose its
    // metadata: an empty block there is a build error.
    const postSource = POST_SOURCES[`${BLOG_ROOT}${post.id}/index.mdx`];
    const postFrontmatter =
        isTldr && postSource !== undefined
            ? mdxToMarkdown(postSource, {
                  slug: post.id,
                  // Only the frontmatter is used here, so the body's images need no real URL.
                  resolveImageUrl: (specifier) => specifier
              }).frontmatter
            : frontmatter;

    if (postFrontmatter === '') {
        throw new Error(`${post.id}: the post has no frontmatter block.`);
    }

    // The post's own frontmatter block, with fields edited rather than the whole block rebuilt:
    // titles and excerpts are free text that Astro already parses on every build, so passing them
    // through removes a class of escaping bug. `heroImage` is a repo-relative source path that
    // resolves to nothing for a detached reader, and `canonical` does not exist in the source.
    const document = parseDocument(postFrontmatter);

    document.set('heroImage', toUrl(post.data.heroImage.src));

    if (isTldr) {
        document.set('canonical', toUrl(tldrPagePath(post.id)));
        document.set('fullPost', toUrl(markdownTwinPath(post.id)));
    } else {
        document.set('canonical', toUrl(postPagePath(post.id)));

        if (props.hasTldr) {
            document.set('tldr', toUrl(tldrTwinPath(post.id)));
        }
    }

    // No post body carries an H1 — the title lives in frontmatter and the page layout renders it —
    // so the twin adds one, or the article reaches an agent with a headless outline.
    const heading = isTldr ? `TL;DR: ${post.data.title}` : post.data.title;
    const twin = `---\n${document.toString()}---\n\n# ${heading}\n\n${body}\n\n${ATTRIBUTION}\n`;

    // For the dev server's benefit only. A prerendered endpoint writes just its body to `dist/`, so
    // the type a client actually sees comes from whichever platform serves the build, not from here.
    return new Response(twin, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' }
    });
};

export { GET, getStaticPaths };
