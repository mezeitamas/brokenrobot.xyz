import React from 'react';
import type { FunctionComponent } from 'react';

type RichResultsArticleProps = {
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

const RichResultsArticle: FunctionComponent<RichResultsArticleProps> = ({
    siteName,
    siteUrl,
    title,
    description,
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
                    "description": "${description}",
                    "datePublished": "${published}",
                    "dateModified": "${published}",
                    "url": "${url}",
                    "author": [{
                        "@type": "Person",
                        "@id": "${siteUrl}/about-me/#Person",
                        "name": "${author.name}",
                        "url": "${siteUrl}/about-me/",
                        "sameAs": [
                            "${author.social.github}",
                            "${author.social.linkedin}"
                        ]
                    }],
                    "publisher": {
                        "@type": "Organization",
                        "name": "${siteName}",
                        "url": "${siteUrl}"
                    },
                    "isPartOf": {
                        "@type" : "WebSite",
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
