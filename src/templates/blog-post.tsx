import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import type { HeadFC, PageProps } from 'gatsby';

import { Layout } from '../components/layout/layout';
import { SeoBlogPosting } from '../components/seo/seo-blog-posting';

type PageContext = {
    id: string;
    title: string;
    published: string;
    slug: string;
    excerpt: string;
    html: string;
};

const BlogPostTemplate: FunctionComponent<PageProps<null, PageContext>> = ({ pageContext }): ReactElement => {
    const { title, published, html } = pageContext;

    return (
        <Layout>
            <article>
                <header>
                    <h1>{title}</h1>

                    <time dateTime={published}>{published}</time>
                </header>

                <section>
                    <div dangerouslySetInnerHTML={{ __html: html }}></div>
                </section>
            </article>
        </Layout>
    );
};

const Head: HeadFC<null, PageContext> = ({ location, pageContext: { title, excerpt, published } }) => (
    <SeoBlogPosting
        title={title}
        description={excerpt}
        pathname={location.pathname}
        published={published}
    />
);

export default BlogPostTemplate;

export { Head };
