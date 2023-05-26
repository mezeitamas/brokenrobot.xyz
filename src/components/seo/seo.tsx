import React from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

import { useSiteMetadata } from '../../hooks/use-site-metadata';

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
    const { title: siteTitle, siteUrl, author } = useSiteMetadata();
    const url = `${siteUrl}${pathname !== undefined ? pathname : ''}`;

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

            <meta
                property="og:locale"
                content="en_GB"
            />
            <meta
                property="og:site_name"
                content={siteTitle}
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

            {isArticle !== true ? (
                <>
                    <meta
                        property="og:type"
                        content="website"
                    />
                </>
            ) : null}

            {isArticle === true ? (
                <>
                    <meta
                        property="og:type"
                        content="article"
                    />
                    <meta
                        property="og:article:published_time"
                        content={published}
                    />
                    <meta
                        property="og:article:author"
                        content={author.name}
                    />
                </>
            ) : null}

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

            {children}
        </>
    );
};

export { Seo };

export type { SeoProps };
