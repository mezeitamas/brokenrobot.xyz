import { resolve } from 'path';

import type { GatsbyNode } from 'gatsby';

const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }) => {
    const { createPage } = actions;
    const result: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        errors?: any;
        data?: {
            allMarkdownRemark: {
                nodes: {
                    id: string;
                    excerpt: string;
                    html: string;
                    frontmatter: {
                        title: string;
                        published: string;
                        slug: string;
                        tags: string;
                    };
                }[];
            };
        };
    } = await graphql(`
        {
            allMarkdownRemark {
                nodes {
                    id
                    excerpt(pruneLength: 250)
                    html
                    frontmatter {
                        title
                        published
                        slug
                        tags
                    }
                }
            }
        }
    `);

    if (result.errors !== undefined) {
        reporter.panicOnBuild('Error loading MD result', result.errors);
    }

    const posts = result.data?.allMarkdownRemark.nodes;

    posts?.forEach((post) => {
        createPage({
            path: `/blog/${post.frontmatter.slug}/`,
            component: resolve(`./src/templates/blog-post.tsx`),
            context: {
                id: post.id,
                title: post.frontmatter.title,
                published: post.frontmatter.published,
                slug: post.frontmatter.slug,
                tags: post.frontmatter.tags,
                excerpt: post.excerpt,
                html: post.html
            }
        });
    });
};

export { createPages };
