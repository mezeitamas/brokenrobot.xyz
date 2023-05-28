const path = require('path');

exports.createPages = async ({ graphql, actions, reporter }) => {
    const result = await graphql(`
        {
            allMarkdownRemark {
                nodes {
                    id
                    html
                    excerpt
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

    if (result.errors) {
        reporter.panicOnBuild('Error loading MDX result', result.errors);
    }

    const posts = result.data.allMarkdownRemark.nodes;
    const { createPage } = actions;
    const BlogPostTemplate = path.resolve(`./src/templates/blog-post.tsx`);

    posts.forEach((post) => {
        createPage({
            path: `/blog/${post.frontmatter.slug}/`,
            component: BlogPostTemplate,
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
