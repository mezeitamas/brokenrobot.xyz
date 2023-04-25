import { graphql, useStaticQuery } from 'gatsby';

type SiteMetadata = {
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
                            github
                            linkedin
                        }
                    }
                }
            }
        }
    `);

    return siteMetadata;
};

export { useSiteMetadata };
