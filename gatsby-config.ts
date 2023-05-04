import dotenv from 'dotenv';
import type { GatsbyConfig } from 'gatsby';

dotenv.config();

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
                icon: 'src/images/icon.svg'
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
            resolve: 'gatsby-source-filesystem',
            options: {
                name: 'images',
                path: './src/images/'
            },
            __key: 'images'
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
                path: './src/content/posts'
            },
            __key: 'posts'
        }
    ]
};

export default config;
