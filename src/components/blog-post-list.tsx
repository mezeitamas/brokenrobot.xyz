import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { BlogPostListItem } from './blog-post-list-item';

type BlogPostListProps = {
    posts: { title: string; excerpt: string; published: string; publishedFormatted: string; slug: string }[];
};

const BlogPostList: FunctionComponent<BlogPostListProps> = ({ posts }): ReactElement => {
    return (
        <div>
            {posts.map(({ title, excerpt, published, publishedFormatted, slug }) => (
                <BlogPostListItem
                    key={slug}
                    title={title}
                    excerpt={excerpt}
                    published={published}
                    publishedFormatted={publishedFormatted}
                    slug={slug}
                />
            ))}
        </div>
    );
};

export { BlogPostList };
