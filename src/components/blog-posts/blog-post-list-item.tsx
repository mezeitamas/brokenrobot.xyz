import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { Link } from 'gatsby';

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
                    <Link to={`/blog/${slug}/`}>{title}</Link>
                </HeadingType>

                <time dateTime={published}>{publishedFormatted}</time>

                <p>{excerpt}</p>
            </header>
        </article>
    );
};

export { BlogPostListItem };

export type { BlogPostListItemProps };
