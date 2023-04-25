import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { Link } from 'gatsby';

type BlogPostListItemProps = {
    title: string;
    excerpt: string;
    published: string;
    slug: string;
};

const BlogPostListItem: FunctionComponent<BlogPostListItemProps> = ({
    title,
    excerpt,
    published,
    slug
}): ReactElement => {
    return (
        <article
            className="flex flex-col items-start justify-between"
            key={slug}
        >
            <header>
                <h3>
                    <Link to={`/blog/${slug}/`}>{title}</Link>
                </h3>

                <time
                    dateTime={published}
                    className="text-sm text-gray-600"
                >
                    {published}
                </time>

                <p>{excerpt}</p>
            </header>
        </article>
    );
};

export { BlogPostListItem };
