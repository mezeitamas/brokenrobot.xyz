import { type CollectionEntry, getCollection } from 'astro:content';

const TLDR_SUFFIX = '/tldr';

// Pairs each TL;DR with its post, as a map from post id to TL;DR entry. Every route that needs to
// know about TL;DRs calls it, so a TL;DR with no post fails the build in this one place.
const getPostsWithTldrs = async (): Promise<Map<string, CollectionEntry<'tldr'>>> => {
    const [posts, tldrs] = await Promise.all([getCollection('blog'), getCollection('tldr')]);
    const postIds = new Set(posts.map((post) => post.id));
    const pairs = new Map<string, CollectionEntry<'tldr'>>();

    for (const tldr of tldrs) {
        const postId = tldr.id.slice(0, -TLDR_SUFFIX.length);

        if (!postIds.has(postId)) {
            throw new Error(`${tldr.id}: TL;DR has no post at src/content/blog/${postId}/index.mdx`);
        }

        pairs.set(postId, tldr);
    }

    return pairs;
};

export { getPostsWithTldrs };
