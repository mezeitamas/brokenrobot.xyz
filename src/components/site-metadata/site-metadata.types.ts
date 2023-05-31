type Author = {
    name: string;
    social: {
        githubUrl: string;
        linkedinUrl: string;
        twitterUrl: string;
        twitterUsername: string;
    };
};

type SiteMetadata = {
    title: string;
    description: string;
    siteUrl: string;
    author: Author;
};

export type { Author, SiteMetadata };
