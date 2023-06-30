import React from 'react';
import type { FunctionComponent, ReactElement, PropsWithChildren } from 'react';

import { useSiteMetadata } from '../site-metadata/use-site-metadata';

import { Content } from './content/content';
import { Footer } from './footer/footer';
import { Header } from './header/header';

const Layout: FunctionComponent<PropsWithChildren> = ({ children }): ReactElement => {
    const { title, author } = useSiteMetadata();

    return (
        <div className="mx-auto max-w-screen-xl px-4 md:px-6 lg:px-8">
            <Header title={title} />

            <Content>{children}</Content>

            <Footer
                githubLink={author.social.githubUrl}
                linkedinLink={author.social.linkedinUrl}
                mastodonLink={author.social.mastodonUrl}
                twitterLink={author.social.twitterUrl}
                authorName={author.name}
            />
        </div>
    );
};

export { Layout };
