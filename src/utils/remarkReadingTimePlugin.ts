import type { Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import getReadingTime from 'reading-time';
import type { VFile } from 'vfile';

const remarkReadingTimePlugin = () => {
    return (tree: Root, file: VFile) => {
        const textOnPage = toString(tree);
        const readingTime = getReadingTime(textOnPage);

        if (file.data.astro?.frontmatter !== undefined) {
            file.data.astro.frontmatter.minutesRead = readingTime.text;
        }
    };
};

export { remarkReadingTimePlugin };
