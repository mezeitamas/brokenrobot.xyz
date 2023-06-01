import { graphql, useStaticQuery } from 'gatsby';

import type { BlogPosts } from './blog-posts.types';

const useBlogPosts = (): BlogPosts => {
    const {
        allMarkdownRemark: { nodes: blogPosts }
    } = useStaticQuery(graphql`
        query GetBlogPosts {
            allMarkdownRemark(sort: { frontmatter: { published: DESC } }) {
                nodes {
                    excerpt(pruneLength: 250)
                    frontmatter {
                        title
                        published
                        slug
                    }
                }
            }
        }
    `);

    return blogPosts;
};

export { useBlogPosts };
