import React from 'react';
import type { FunctionComponent } from 'react';

type MetaTwitterProps = {
    title: string;
    description: string;
    url: string;
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

const MetaTwitter: FunctionComponent<MetaTwitterProps> = ({ title, description, url, author }) => {
    return (
        <>
            <meta
                name="twitter:card"
                content="summary"
            />
            <meta
                name="twitter:title"
                content={title}
            />
            <meta
                name="twitter:description"
                content={description}
            />
            <meta
                name="twitter:url"
                content={url}
            />
            <meta
                name="twitter:creator"
                content={author.social.twitterUsername}
            />
        </>
    );
};

export { MetaTwitter };

export type { MetaTwitterProps };
