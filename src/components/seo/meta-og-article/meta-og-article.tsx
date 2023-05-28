import React from 'react';
import type { FunctionComponent } from 'react';

type MetaOgArticleProps = {
    siteName: string;
    title: string;
    description: string;
    url: string;
    published: string;
    tags: string[];
    author: string;
};

const MetaOgArticle: FunctionComponent<MetaOgArticleProps> = ({
    siteName,
    title,
    description,
    url,
    published,
    tags,
    author
}) => {
    return (
        <>
            <meta
                property="og:type"
                content="article"
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
            <meta
                property="og:article:published_time"
                content={published}
            />

            {tags.map((tag) => (
                <meta
                    property="og:article:tag"
                    content={tag}
                />
            ))}

            <meta
                property="og:article:author"
                content={author}
            />
        </>
    );
};

export { MetaOgArticle };

export type { MetaOgArticleProps };
