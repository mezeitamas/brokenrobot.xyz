import React from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

import { useSiteMetadata } from '../../hooks/use-site-metadata';

type SeoProps = {
    title?: string;
    description?: string;
    pathname?: string;
};

const Seo: FunctionComponent<PropsWithChildren<SeoProps>> = ({ title, description, pathname, children }) => {
    const { title: defaultTitle, description: defaultDescription, siteUrl } = useSiteMetadata();

    const seo = {
        title: title !== undefined ? title : defaultTitle,
        description: description !== undefined ? description : defaultDescription,
        url: `${siteUrl}${pathname !== undefined ? pathname : ''}`
    };

    return (
        <>
            <html lang="en" />

            <title>{seo.title}</title>

            <meta
                httpEquiv="cache-control"
                content="public, max-age=0, must-revalidate"
            />

            <meta
                name="description"
                content={seo.description}
            />

            <meta
                property="og:title"
                content={seo.title}
            />
            <meta
                property="og:description"
                content={seo.description}
            />
            <meta
                property="og:type"
                content="website"
            />

            <meta
                name="twitter:title"
                content={seo.title}
            />
            <meta
                name="twitter:description"
                content={seo.description}
            />
            <meta
                name="twitter:card"
                content="summary"
            />
            <meta
                name="twitter:url"
                content={seo.url}
            />

            {children}
        </>
    );
};

export { Seo };

export type { SeoProps };
