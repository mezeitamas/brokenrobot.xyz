import React from 'react';
import type { FunctionComponent } from 'react';

import { useSiteMetadata } from '../../site-metadata/use-site-metadata';

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

const SeoBlogPosting: FunctionComponent<SeoBlogPostingProps> = ({ title, description, pathname, published, tags }) => {
    const { title: siteName, siteUrl, author } = useSiteMetadata();
    const url = `${siteUrl}${pathname}`;

    return (
        <>
            <title>{title}</title>

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
                author={author}
            />
        </>
    );
};

export { SeoBlogPosting };

export type { SeoBlogPostingProps };
