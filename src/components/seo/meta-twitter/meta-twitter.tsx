import React from 'react';
import type { FunctionComponent } from 'react';

type MetaTwitterProps = {
    title: string;
    description: string;
    url: string;
};

const MetaTwitter: FunctionComponent<MetaTwitterProps> = ({ title, description, url }) => {
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
        </>
    );
};

export { MetaTwitter };

export type { MetaTwitterProps };
