import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { Link, graphql, useStaticQuery } from 'gatsby';
import type { HeadFC, PageProps } from 'gatsby';

import { BlogPostList } from '../components/blog-post-list';
import { Layout } from '../components/layout';
import { Seo } from '../components/seo';

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
                <h2>Hello there, I'm Tamas!</h2>

                <p>
                    Welcome to my little corner of the web, where I share my professional experiences, thoughts,
                    adventures, and projects with the world. For further information, please feel free to check out my{' '}
                    <Link to="/about-me">About me</Link> page.
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

export const Head: HeadFC = () => <Seo />;
