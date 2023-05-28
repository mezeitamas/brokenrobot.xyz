import React from 'react';
import type { FunctionComponent } from 'react';

import type { Person, Organization, WithContext, WebPage } from 'schema-dts';

type RichResultsWebPageProps = {
    siteName: string;
    siteUrl: string;
    author: {
        name: string;
        social: {
            github: string;
            linkedin: string;
        };
    };
};

const RichResultsWebPage: FunctionComponent<RichResultsWebPageProps> = ({ siteName, siteUrl, author }) => {
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

    const webPage: WithContext<WebPage> = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${siteUrl}/#WebPage`,
        name: siteName,
        url: siteUrl,
        inLanguage: 'en-US',
        author: [authorPerson],
        publisher: publisher
    };

    return <script type="application/ld+json">{JSON.stringify(webPage)}</script>;
};

export { RichResultsWebPage };

export type { RichResultsWebPageProps };
