import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { InternalLink } from '../internal-link/internal-link';

type BlogPostListItemProps = {
    title: string;
    excerpt: string;
    published: string;
    publishedFormatted: string;
    slug: string;
    HeadingType: keyof JSX.IntrinsicElements;
};

const BlogPostListItem: FunctionComponent<BlogPostListItemProps> = ({
    title,
    excerpt,
    published,
    publishedFormatted,
    slug,
    HeadingType
}): ReactElement => {
    return (
        <article
            className="flex flex-col items-start justify-between"
            key={slug}
        >
            <header>
                <HeadingType>
                    <InternalLink to={`/blog/${slug}/`}>{title}</InternalLink>
                </HeadingType>

                <time dateTime={published}>{publishedFormatted}</time>

                <p>{excerpt}</p>
            </header>
        </article>
    );
};

export { BlogPostListItem };

export type { BlogPostListItemProps };
