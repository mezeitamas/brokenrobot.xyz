import { mdxToMdast } from 'satteri';
import type { MdastNode } from 'satteri';

// Converts a blog post's authored MDX into the agent-facing Markdown twin served at
// `/blog/<slug>/index.md`, by splicing the source at node offsets rather than re-serializing the
// parsed tree. Everything outside a spliced range is copied through character-for-character, so a
// fenced code sample — including one holding markup that resembles component syntax — reaches the
// twin exactly as it was written.
//
// The offsets satteri reports index the JavaScript string, not the UTF-8 bytes. Several posts carry
// emoji and typographic quotes, so the source must be spliced as a string; the same numbers applied
// to a Buffer drift by one position per multi-byte character.

// A default import binding one identifier to one specifier. `mdxjsEsm` nodes group consecutive
// import lines into a single node, so the identifier map is built from the statements, not from the
// nodes.
const IMPORT_STATEMENT = /^\s*import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+)['"];?\s*$/;

// The one component the blog uses in body content.
const PICTURE_COMPONENT = 'BlogPostPicture';

type ImageUrlResolver = (specifier: string) => string | undefined;

type MarkdownTwin = {
    // The post's own frontmatter block, without its `---` delimiters, exactly as authored.
    frontmatter: string;
    // The article prose, with imports removed and component pictures rewritten.
    body: string;
};

type SourceRange = {
    start: number;
    end: number;
};

type Splice = SourceRange & {
    text: string;
};

const childrenOf = (node: MdastNode): MdastNode[] => ('children' in node ? node.children : []);

const walk = (node: MdastNode): MdastNode[] => [node, ...childrenOf(node).flatMap(walk)];

const rangeOf = (node: MdastNode, slug: string): SourceRange => {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;

    if (start === undefined || end === undefined) {
        throw new Error(`${slug}: satteri returned a "${node.type}" node without source offsets.`);
    }

    return { start, end };
};

// Relative specifiers bind image files. An aliased specifier such as
// `@components/picture/BlogPostPicture.astro` binds a component, so it never enters the map.
const importedImages = (nodes: MdastNode[]): Map<string, string> => {
    const bindings = new Map<string, string>();

    for (const node of nodes) {
        if (node.type !== 'mdxjsEsm') {
            continue;
        }

        for (const line of node.value.split('\n')) {
            const match = IMPORT_STATEMENT.exec(line);

            if (match === null) {
                continue;
            }

            const [, identifier, specifier] = match;

            if (identifier !== undefined && specifier?.startsWith('.') === true) {
                bindings.set(identifier, specifier);
            }
        }
    }

    return bindings;
};

const attributeValue = (node: Extract<MdastNode, { type: 'mdxJsxFlowElement' }>, name: string): string | undefined => {
    const attribute = node.attributes.find(
        (candidate) => candidate.type === 'mdxJsxAttribute' && candidate.name === name
    );

    if (attribute?.type !== 'mdxJsxAttribute') {
        return undefined;
    }

    return typeof attribute.value === 'string' ? attribute.value : attribute.value?.value;
};

const pictureSplice = (
    node: Extract<MdastNode, { type: 'mdxJsxFlowElement' }>,
    slug: string,
    images: Map<string, string>,
    resolveImageUrl: ImageUrlResolver
): Splice => {
    const identifier = attributeValue(node, 'src');
    const alt = attributeValue(node, 'alt');

    if (identifier === undefined || alt === undefined) {
        throw new Error(`${slug}: a <${PICTURE_COMPONENT}> is missing its "src" or "alt" attribute.`);
    }

    const specifier = images.get(identifier);

    if (specifier === undefined) {
        throw new Error(`${slug}: <${PICTURE_COMPONENT} src={${identifier}}> has no matching image import.`);
    }

    const url = resolveImageUrl(specifier);

    if (url === undefined) {
        throw new Error(`${slug}: the image "${specifier}", imported as "${identifier}", resolves to no asset.`);
    }

    return { ...rangeOf(node, slug), text: `![${alt}](${url})` };
};

// An authored Markdown image names its file by a source-relative path, which Astro rewrites to a
// hashed asset URL on build. It goes through the same lookup and the same guard as a component
// picture, so both kinds of image reach the twin as a URL that resolves away from the origin. A URL
// that is already absolute is the author's own reference and passes through untouched.
const imageSplice = (
    node: Extract<MdastNode, { type: 'image' }>,
    slug: string,
    resolveImageUrl: ImageUrlResolver
): Splice | undefined => {
    if (!node.url.startsWith('.')) {
        return undefined;
    }

    const url = resolveImageUrl(node.url);

    if (url === undefined) {
        throw new Error(`${slug}: the image "${node.url}" resolves to no asset.`);
    }

    const title = node.title === null || node.title === undefined ? '' : ` "${node.title}"`;

    return { ...rangeOf(node, slug), text: `![${node.alt ?? ''}](${url}${title})` };
};

const mdxToMarkdown = (
    source: string,
    { slug, resolveImageUrl }: { slug: string; resolveImageUrl: ImageUrlResolver }
): MarkdownTwin => {
    const nodes = walk(mdxToMdast(source, { position: true }));

    const frontmatterNode = nodes.find((node) => node.type === 'yaml');

    if (frontmatterNode === undefined) {
        throw new Error(`${slug}: the post has no frontmatter block.`);
    }

    const images = importedImages(nodes);
    const splices: Splice[] = [];

    for (const node of nodes) {
        if (node.type === 'image') {
            const splice = imageSplice(node, slug, resolveImageUrl);

            if (splice !== undefined) {
                splices.push(splice);
            }

            continue;
        }

        if (!node.type.startsWith('mdx')) {
            continue;
        }

        if (node.type === 'mdxjsEsm') {
            splices.push({ ...rangeOf(node, slug), text: '' });
            continue;
        }

        if (node.type === 'mdxJsxFlowElement' && node.name === PICTURE_COMPONENT) {
            splices.push(pictureSplice(node, slug, images, resolveImageUrl));
            continue;
        }

        // Anything left is authoring syntax the transform was never taught — a new component, or an
        // expression. Asking the parser what is unhandled is exact, where scanning the output for
        // residual markup could only approximate it.
        const name = 'name' in node && node.name !== null ? `<${node.name}>` : `a "${node.type}" node`;

        throw new Error(`${slug}: unhandled MDX syntax — ${name}. The transform only knows <${PICTURE_COMPONENT}>.`);
    }

    const bodyStart = rangeOf(frontmatterNode, slug).end;
    let cursor = bodyStart;
    let body = '';

    for (const splice of splices.sort((a, b) => a.start - b.start)) {
        body += source.slice(cursor, splice.start) + splice.text;
        cursor = splice.end;
    }

    body += source.slice(cursor);

    return { frontmatter: frontmatterNode.value, body: body.trim() };
};

export { mdxToMarkdown };
