import React from 'react';
import type { FunctionComponent } from 'react';

import type { Person, Organization, WebSite, BlogPosting, WithContext } from 'schema-dts';

type RichResultsBlogPostingProps = {
    siteName: string;
    siteUrl: string;
    title: string;
    description: string;
    url: string;
    published: string;
    author: {
        name: string;
        social: {
            github: string;
            linkedin: string;
        };
    };
};

const RichResultsBlogPosting: FunctionComponent<RichResultsBlogPostingProps> = ({
    siteName,
    siteUrl,
    title,
    description,
    url,
    published,
    author
}) => {
    const authorPerson: Person = {
        '@type': 'Person',
        '@id': `${siteUrl}/about-me/#Person`,
        name: author.name,
        url: `${siteUrl}/about-me/`,
        sameAs: [author.social.github, author.social.linkedin]
    };

    const publisher: Organization = {
        '@type': 'Organization',
        '@id': `${siteUrl}/#Organization`,
        name: siteName,
        url: siteUrl
    };

    const website: WebSite = {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#WebSite`,
        name: siteName,
        url: siteUrl,
        inLanguage: 'en-US',
        author: [authorPerson],
        publisher: publisher
    };

    const blogPosting: WithContext<BlogPosting> = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': `${url}#BlogPosting`,
        headline: title,
        name: title,
        description: description,
        datePublished: published,
        dateModified: published,
        url: url,
        inLanguage: 'en-US',
        author: [authorPerson],
        publisher: publisher,
        isPartOf: website
    };

    return <script type="application/ld+json">{JSON.stringify(blogPosting)}</script>;
};

export { RichResultsBlogPosting };

export type { RichResultsBlogPostingProps };
