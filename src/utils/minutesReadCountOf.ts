// `remarkPluginFrontmatter` is `Record<string, any>`, so reading `minutesReadCount` from it checks
// nothing. This fails the build when the plugin did not write a number, instead of letting a link
// drop or print "undefined min read".
const minutesReadCountOf = (frontmatter: Record<string, unknown>): number => {
    const count = frontmatter['minutesReadCount'];

    if (typeof count !== 'number') {
        throw new Error(`readingTimePlugin wrote no numeric minutesReadCount (got ${String(count)}).`);
    }

    return count;
};

export { minutesReadCountOf };
