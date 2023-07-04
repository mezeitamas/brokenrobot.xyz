import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import type { HeadFC, PageProps } from 'gatsby';

import { BlogPostList } from '../components/blog-post-list';
import { useRecentBlogPosts } from '../components/blog-posts/use-recent-blog-posts';
import { InternalLink } from '../components/internal-link/internal-link';
import { Layout } from '../components/layout/layout';
import { SeoWebPage } from '../components/seo/seo-web-page';
import { useSiteMetadata } from '../components/site-metadata/use-site-metadata';

const IndexPage: FunctionComponent<PageProps> = (): ReactElement => {
    const recentBlogPosts = useRecentBlogPosts();

    const posts = recentBlogPosts.map((blogPost) => {
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
            <section className="mb-24">
                <h1>Hello there, I'm Tamas!</h1>

                <p>
                    Welcome to my little corner of the web, where I share my professional experiences, thoughts,
                    adventures, and projects with the world. For further information, please feel free to check out my{' '}
                    <InternalLink to="/about-me">About me</InternalLink> page.
                </p>
            </section>

            <section>
                <h1>Recent blog posts</h1>

                <BlogPostList posts={posts} />
            </section>
        </Layout>
    );
};

export default IndexPage;

export const Head: HeadFC = ({ location }) => {
    const { title, description } = useSiteMetadata();

    return (
        <SeoWebPage
            title={title}
            description={description}
            pathname={location.pathname}
        />
    );
};
