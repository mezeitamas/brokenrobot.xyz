import React from 'react';
import type { FunctionComponent, ReactElement, PropsWithChildren } from 'react';

import { useSiteMetadata } from '../site-metadata/use-site-metadata';

import { Content } from './content/content';
import { Footer } from './footer/footer';
import { Header } from './header/header';

const Layout: FunctionComponent<PropsWithChildren> = ({ children }): ReactElement => {
    const { title, author } = useSiteMetadata();

    return (
        <div className="container mx-auto bg-white px-4">
            <Header title={title} />

            <Content>{children}</Content>

            <Footer
                githubLink={author.social.githubUrl}
                linkedinLink={author.social.linkedinUrl}
                twitterLink={author.social.twitterUrl}
                authorName={author.name}
            />
        </div>
    );
};

export { Layout };
