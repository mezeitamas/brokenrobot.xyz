import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { Link } from 'gatsby';

type BlogPostListItemProps = {
    title: string;
    excerpt: string;
    published: string;
    publishedFormatted: string;
    slug: string;
};

const BlogPostListItem: FunctionComponent<BlogPostListItemProps> = ({
    title,
    excerpt,
    published,
    publishedFormatted,
    slug
}): ReactElement => {
    return (
        <article
            className="flex flex-col items-start justify-between"
            key={slug}
        >
            <header>
                <h2>
                    <Link to={`/blog/${slug}/`}>{title}</Link>
                </h2>

                <time dateTime={published}>{publishedFormatted}</time>

                <p>{excerpt}</p>
            </header>
        </article>
    );
};

export { BlogPostListItem };
