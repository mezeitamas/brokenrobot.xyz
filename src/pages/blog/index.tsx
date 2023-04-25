import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { graphql, useStaticQuery } from 'gatsby';
import type { HeadFC } from 'gatsby';

import { BlogPostList } from '../../components/blog-post-list';
import { Layout } from '../../components/layout';
import { Seo } from '../../components/seo';

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

const BlogPage: FunctionComponent = (): ReactElement => {
    const {
        allMarkdownRemark: { nodes }
    } = useStaticQuery<DataType>(
        graphql`
            query {
                allMarkdownRemark(sort: { frontmatter: { published: DESC } }) {
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
                <header>
                    <h2 className="text-gray-900">Blog posts</h2>
                </header>

                <BlogPostList posts={posts} />
            </div>
        </Layout>
    );
};

export default BlogPage;

export const Head: HeadFC = () => <Seo title="Blog" />;
