import dotenv from 'dotenv';
import type { GatsbyConfig } from 'gatsby';

dotenv.config();

// An inelegant method for adding types, which will require refactoring later on.
type DataType = {
    query: {
        site: {
            siteMetadata: {
                title: string;
                description: string;
                siteUrl: string;
                author: {
                    name: string;
                    social: {
                        github: string;
                        linkedin: string;
                    };
                };
            };
        };
        allMarkdownRemark: {
            nodes: [
                {
                    excerpt: string;
                    html: string;
                    frontmatter: {
                        title: string;
                        published: string;
                        slug: string;
                    };
                }
            ];
        };
    };
};

const config: GatsbyConfig = {
    siteMetadata: {
        title: 'Broken Robot',
        description:
            'Personal website and blog of Tamas Mezei. Welcome to my little corner of the web, where I share my professional experiences, thoughts, adventures, and projects with the world.',
        siteUrl: 'https://www.brokenrobot.xyz',
        author: {
            name: 'Tamas Mezei',
            social: {
                github: 'https://github.com/mezeitamas',
                linkedin: 'https://www.linkedin.com/in/mezeitamas/'
            }
        }
    },
    graphqlTypegen: true,
    plugins: [
        'gatsby-plugin-postcss',
        'gatsby-plugin-image',
        'gatsby-plugin-sitemap',
        {
            resolve: 'gatsby-plugin-manifest',
            options: {
                icon: 'src/assets/brokenrobot.svg'
            }
        },
        {
            resolve: 'gatsby-plugin-canonical-urls',
            options: {
                siteUrl: 'https://www.brokenrobot.xyz',
                stripQueryString: true
            }
        },
        'gatsby-plugin-sharp',
        {
            resolve: 'gatsby-transformer-remark',
            options: {
                footnotes: true,
                gfm: false,
                plugins: [
                    {
                        resolve: 'gatsby-remark-autolink-headers',
                        options: {
                            className: 'autolink-header',
                            isIconAfterHeader: true
                        }
                    },
                    {
                        resolve: 'gatsby-remark-prismjs',
                        options: {
                            classPrefix: 'language-',
                            inlineCodeMarker: null,
                            aliases: {},
                            showLineNumbers: false,
                            noInlineHighlight: false,
                            languageExtensions: [
                                {
                                    language: 'superscript',
                                    extend: 'javascript',
                                    definition: {
                                        superscript_types: /(SuperType)/
                                    },
                                    insertBefore: {
                                        function: {
                                            superscript_keywords: /(superif|superelse)/
                                        }
                                    }
                                }
                            ],
                            prompt: {
                                user: 'root',
                                host: 'localhost',
                                global: false
                            },
                            escapeEntities: {}
                        }
                    },
                    {
                        resolve: 'gatsby-remark-images',
                        options: {
                            maxWidth: 590,
                            backgroundColor: 'transparent'
                        }
                    },
                    'gatsby-remark-copy-linked-files',
                    'gatsby-remark-smartypants'
                ],
                jsFrontmatterEngine: false
            }
        },
        'gatsby-transformer-sharp',
        {
            resolve: 'gatsby-plugin-catch-links',
            options: {
                excludePattern: /(excluded-link|external)/
            }
        },
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: 'assets',
                path: './src/assets/'
            },
            __key: 'assets'
        },
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: 'pages',
                path: './src/pages/'
            },
            __key: 'pages'
        },
        {
            resolve: 'gatsby-source-filesystem',
            options: {
                name: 'posts',
                path: './content/posts'
            },
            __key: 'posts'
        },
        {
            resolve: `gatsby-plugin-feed`,
            options: {
                query: `
                {
                  site {
                    siteMetadata {
                      title
                      description
                      siteUrl
                      site_url: siteUrl
                    }
                  }
                }
              `,
                feeds: [
                    {
                        serialize: ({ query: { site, allMarkdownRemark } }: DataType) => {
                            return allMarkdownRemark.nodes.map((node) => {
                                return Object.assign({}, node.frontmatter, {
                                    description: node.excerpt,
                                    date: node.frontmatter.published,
                                    url: `${site.siteMetadata.siteUrl}/blog/${node.frontmatter.slug}`,
                                    guid: `${site.siteMetadata.siteUrl}/blog/${node.frontmatter.slug}`,
                                    custom_elements: [{ 'content:encoded': node.html }]
                                });
                            });
                        },
                        query: `
                    {
                      allMarkdownRemark(
                        sort: { order: DESC, fields: [frontmatter___published] },
                      ) {
                        nodes {
                          excerpt(pruneLength: 250)
                          html
                          frontmatter {
                            title
                            published
                            slug
                          }
                        }
                      }
                    }
                  `,
                        output: '/rss.xml',
                        title: 'Broken Robot | RSS Feed'
                    }
                ]
            }
        }
    ]
};

export default config;
