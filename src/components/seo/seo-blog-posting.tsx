import React from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

import { useSiteMetadata } from '../../hooks/use-site-metadata';

import { MetaOgArticle } from './meta-og-article/meta-og-article';
import { MetaTwitter } from './meta-twitter/meta-twitter';
import { RichResultsBlogPosting } from './rich-results-blog-posting/rich-results-blog-posting';

type SeoBlogPostingProps = {
    title: string;
    description: string;
    pathname: string;
    published: string;
    tags: string[];
};

const SeoBlogPosting: FunctionComponent<PropsWithChildren<SeoBlogPostingProps>> = ({
    title,
    description,
    pathname,
    published,
    tags,
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

            <meta
                name="keywords"
                content={tags.join(', ')}
            />

            <MetaOgArticle
                siteName={siteName}
                title={title}
                description={description}
                url={url}
                published={published}
                tags={tags}
                author={author.name}
            />

            <RichResultsBlogPosting
                siteName={siteName}
                siteUrl={siteUrl}
                title={title}
                description={description}
                url={url}
                published={published}
                author={author}
            />

            <MetaTwitter
                title={title}
                description={description}
                url={url}
            />

            {children}
        </>
    );
};

export { SeoBlogPosting };

export type { SeoBlogPostingProps };
