import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import type { HeadFC } from 'gatsby';

import { BlogPostList } from '../../components/blog-post-list';
import { useBlogPosts } from '../../components/blog-posts/use-blog-posts';
import { DocumentHead } from '../../components/document-head/document-head';
import { SeoWebPage } from '../../components/document-head/seo/seo-web-page';
import { Layout } from '../../components/layout/layout';

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
            <div>
                <header>
                    <h2 className="text-gray-900">Blog posts</h2>
                </header>

                <BlogPostList posts={posts} />
            </div>
        </Layout>
    );
};

export default BlogPage;

export const Head: HeadFC = ({ location }) => {
    return (
        <DocumentHead>
            <SeoWebPage
                title="Blog"
                description="Blog posts"
                pathname={location.pathname}
            />
        </DocumentHead>
    );
};
