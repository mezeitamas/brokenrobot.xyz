import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import type { HeadFC } from 'gatsby';

import { BlogPostList } from '../../components/blog-post-list';
import { useBlogPosts } from '../../components/blog-posts/use-blog-posts';
import { Layout } from '../../components/layout/layout';
import { SeoWebPage } from '../../components/seo/seo-web-page';

const BlogPage: FunctionComponent = (): ReactElement => {
    const blogPosts = useBlogPosts();

    const posts = blogPosts.map((blogPost) => {
        return {
            title: blogPost.frontmatter.title,
            excerpt: blogPost.excerpt,
            published: blogPost.frontmatter.published,
            publishedFormatted: new Date(blogPost.frontmatter.published).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            slug: blogPost.frontmatter.slug
        };
    });

    return (
        <Layout>
            <section>
                <h1>Blog posts</h1>

                <BlogPostList
                    posts={posts}
                    HeadingType="h2"
                />
            </section>
        </Layout>
    );
};

export default BlogPage;

export const Head: HeadFC = ({ location }) => (
    <SeoWebPage
        title="Blog"
        description="Blog posts"
        pathname={location.pathname}
    />
);
