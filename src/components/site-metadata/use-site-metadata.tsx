import { graphql, useStaticQuery } from 'gatsby';

import type { SiteMetadata } from './site-metadata.types';

type Site = {
    site: {
        siteMetadata: SiteMetadata;
    };
};

const useSiteMetadata = (): SiteMetadata => {
    const {
        site: { siteMetadata }
    } = useStaticQuery<Site>(graphql`
        query {
            site {
                siteMetadata {
                    title
                    description
                    siteUrl
                    author {
                        name
                        social {
                            githubUrl
                            linkedinUrl
                            mastodonUrl
                            mastodonUsername
                            twitterUrl
                            twitterUsername
                        }
                    }
                }
            }
        }
    `);

    return siteMetadata;
};

export { useSiteMetadata };
