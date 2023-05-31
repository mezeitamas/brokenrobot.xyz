import React from 'react';
import type { FunctionComponent, ReactElement, PropsWithChildren } from 'react';

import { useSiteMetadata } from '../../hooks/use-site-metadata';

import { Content } from './content/content';
import { Footer } from './footer/footer';
import { Header } from './header/header';

const Layout: FunctionComponent<PropsWithChildren> = ({ children }): ReactElement => {
    const siteMetadata = useSiteMetadata();

    return (
        <div className="container mx-auto bg-white px-4">
            <Header title={siteMetadata.title} />

            <Content>{children}</Content>

            <Footer
                githubLink={siteMetadata.author.social.githubUrl}
                linkedinLink={siteMetadata.author.social.linkedinUrl}
                twitterLink={siteMetadata.author.social.twitterUrl}
                authorName={siteMetadata.author.name}
            />
        </div>
    );
};

export { Layout };
