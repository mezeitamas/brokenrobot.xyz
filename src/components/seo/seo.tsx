import React from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

import { useSiteMetadata } from '../../hooks/use-site-metadata';

import { MetaOgArticle } from './meta-og-article/meta-og-article';
import { MetaOgWebsite } from './meta-og-website/meta-og-website';
import { MetaTwitter } from './meta-twitter/meta-twitter';
import { RichResultsArticle } from './rich-results-article/rich-results-article';

type SeoProps = {
    title: string;
    description: string;
    pathname: string;
    isArticle: boolean;
    published?: string;
};

const Seo: FunctionComponent<PropsWithChildren<SeoProps>> = ({
    title,
    description,
    pathname,
    isArticle,
    published,
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

            {isArticle === true ? (
                <>
                    <MetaOgArticle
                        siteName={siteName}
                        title={title}
                        description={description}
                        url={url}
                        published={published === undefined ? '' : published}
                        author={author.name}
                    />

                    <RichResultsArticle
                        siteName={siteName}
                        siteUrl={siteUrl}
                        title={title}
                        url={url}
                        published={published === undefined ? '' : published}
                        author={author.name}
                    />
                </>
            ) : null}

            {isArticle !== true ? (
                <MetaOgWebsite
                    siteName={siteName}
                    title={title}
                    description={description}
                    url={url}
                />
            ) : null}

            <MetaTwitter
                title={title}
                description={description}
                url={url}
            />

            {children}
        </>
    );
};

export { Seo };

export type { SeoProps };
