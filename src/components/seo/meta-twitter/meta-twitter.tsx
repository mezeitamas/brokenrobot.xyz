import React from 'react';
import type { FunctionComponent } from 'react';

import type { Author } from '../../site-metadata/site-metadata.types';

type MetaTwitterProps = {
    title: string;
    description: string;
    url: string;
    author: Author;
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
