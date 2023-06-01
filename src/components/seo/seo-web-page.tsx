import React from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

import { useSiteMetadata } from '../site-metadata/use-site-metadata';

import { MetaOgWebsite } from './meta-og-website/meta-og-website';
import { MetaTwitter } from './meta-twitter/meta-twitter';
import { RichResultsWebPage } from './rich-results-web-page/rich-results-web-page';

type SeoWebPageProps = {
    title: string;
    description: string;
    pathname: string;
};

const SeoWebPage: FunctionComponent<PropsWithChildren<SeoWebPageProps>> = ({
    title,
    description,
    pathname,
    children
}) => {
    const { title: siteName, siteUrl, author } = useSiteMetadata();
    const url = `${siteUrl}${pathname}`;

    return (
        <>
            <html lang="en" />

            <title>{title}</title>

            <meta
                httpEquiv="cache-control"
                content="public, max-age=0, must-revalidate"
            />

            <meta
                name="description"
                content={description}
            />

            <MetaOgWebsite
                siteName={siteName}
                title={title}
                description={description}
                url={url}
            />

            <RichResultsWebPage
                siteName={siteName}
                siteUrl={siteUrl}
                author={author}
            />

            <MetaTwitter
                title={title}
                description={description}
                url={url}
                author={author}
            />

            {children}
        </>
    );
};

export { SeoWebPage };

export type { SeoWebPageProps };
