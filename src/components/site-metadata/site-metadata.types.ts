type Author = {
    name: string;
    social: {
        githubUrl: string;
        linkedinUrl: string;
        mastodonUrl: string;
        mastodonUsername: string;
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
