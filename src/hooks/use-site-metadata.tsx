import { graphql, useStaticQuery } from 'gatsby';

type SiteMetadata = {
    title: string;
    description: string;
    siteUrl: string;
    author: {
        name: string;
        social: {
            githubUrl: string;
            linkedinUrl: string;
            twitterUrl: string;
            twitterUsername: string;
        };
    };
};

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
