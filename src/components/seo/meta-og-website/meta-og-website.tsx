import React from 'react';
import type { FunctionComponent } from 'react';

type MetaOgWebsiteProps = {
    siteName: string;
    title: string;
    description: string;
    url: string;
};

const MetaOgWebsite: FunctionComponent<MetaOgWebsiteProps> = ({ siteName, title, description, url }) => {
    return (
        <>
            <meta
                property="og:type"
                content="website"
            />

            <meta
                property="og:locale"
                content="en_US"
            />
            <meta
                property="og:site_name"
                content={siteName}
            />
            <meta
                property="og:title"
                content={title}
            />
            <meta
                property="og:description"
                content={description}
            />
            <meta
                property="og:url"
                content={url}
            />
        </>
    );
};

export { MetaOgWebsite };

export type { MetaOgWebsiteProps };
