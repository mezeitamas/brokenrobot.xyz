import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { graphql, useStaticQuery } from 'gatsby';
import type { HeadFC, PageProps } from 'gatsby';

import { BlogPostList } from '../components/blog-post-list';
import { InternalLink } from '../components/internal-link/internal-link';
import { Layout } from '../components/layout/layout';
import { Seo } from '../components/seo/seo';

type DataType = {
    allMarkdownRemark: {
        nodes: [
            {
                excerpt: string;
                frontmatter: {
                    title: string;
                    published: string;
                    slug: string;
                };
            }
        ];
    };
};

const IndexPage: FunctionComponent<PageProps> = (): ReactElement => {
    const {
        allMarkdownRemark: { nodes }
    } = useStaticQuery<DataType>(
        graphql`
            query {
                allMarkdownRemark(limit: 3, sort: { frontmatter: { published: DESC } }) {
                    nodes {
                        excerpt
                        frontmatter {
                            title
                            published
                            slug
                        }
                    }
                }
            }
        `
    );

    const posts = nodes.map((node) => {
        return {
            title: node.frontmatter.title,
            excerpt: node.excerpt,
            published: node.frontmatter.published,
            slug: node.frontmatter.slug
        };
    });

    return (
        <Layout>
            <div>
                <h2>Hello there, I'm Tamás!</h2>

                <p>
                    Welcome to my little corner of the web, where I share my professional experiences, thoughts,
                    adventures, and projects with the world. For further information, please feel free to check out my{' '}
                    <InternalLink to="/about-me">About me</InternalLink> page.
                </p>
            </div>

            <div>
                <h2>Recent blog posts</h2>

                <BlogPostList posts={posts} />
            </div>
        </Layout>
    );
};

export default IndexPage;

export const Head: HeadFC = ({ location }) => (
    <Seo
        title="Broken Robot"
        description="Personal website and blog of Tamas Mezei. Welcome to my little corner of the web, where I share my professional experiences, thoughts, adventures, and projects with the world."
        pathname={location.pathname}
        isArticle={false}
    />
);
