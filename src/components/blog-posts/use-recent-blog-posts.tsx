import { graphql, useStaticQuery } from 'gatsby';

import type { BlogPosts } from './blog-posts.types';

const useRecentBlogPosts = (): BlogPosts => {
    const {
        allMarkdownRemark: { nodes: recentBlogPosts }
    } = useStaticQuery(graphql`
        query GetRecentBlogPosts {
            allMarkdownRemark(limit: 3, sort: { frontmatter: { published: DESC } }) {
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

    return recentBlogPosts;
};

export { useRecentBlogPosts };
