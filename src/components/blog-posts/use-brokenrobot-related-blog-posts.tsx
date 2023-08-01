import { graphql, useStaticQuery } from 'gatsby';

import type { BlogPosts } from './blog-posts.types';

const useBrokenRobotRelatedBlogPosts = (): BlogPosts => {
    const {
        allMarkdownRemark: { nodes: blogPosts }
    } = useStaticQuery(graphql`
        query GetBrokenRobotRelatedBlogPosts {
            allMarkdownRemark(
                filter: { frontmatter: { tags: { eq: "brokenrobot" } } }
                sort: { frontmatter: { published: ASC } }
            ) {
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

export { useBrokenRobotRelatedBlogPosts };
