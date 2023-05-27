import React from 'react';
import type { FunctionComponent } from 'react';

type RichResultsArticleProps = {
    siteName: string;
    siteUrl: string;
    title: string;
    url: string;
    published: string;
    author: string;
};

const RichResultsArticle: FunctionComponent<RichResultsArticleProps> = ({
    siteName,
    siteUrl,
    title,
    url,
    published,
    author
}) => {
    return (
        <script type="application/ld+json">
            {`
                {
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "@id": "${url}#BlogPosting",
                    "headline": "${title}",
                    "name": "${title}",
                    "datePublished": "${published}",
                    "url": "${url}",
                    "author": [{
                        "@type": "Person",
                        "@id": "${siteUrl}/about-me/#Person",
                        "name": "${author}",
                        "url": "${siteUrl}/about-me/"
                    }],
                    "isPartOf": {
                        "@type" : "Blog",
                        "@id": "${siteUrl}",
                        "name": "${siteName}"
                    },
                    "keywords": []
                }
            `}
        </script>
    );
};

export { RichResultsArticle };

export type { RichResultsArticleProps };
