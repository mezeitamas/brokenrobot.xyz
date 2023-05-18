import React from 'react';
import type { FunctionComponent, ReactElement, PropsWithChildren } from 'react';

import { FiRss, FiGithub, FiLinkedin } from 'react-icons/fi';

import { useSiteMetadata } from '../hooks/use-site-metadata';

import { ExternalLink } from './external-link';
import { InternalLink } from './internal-link';

const Layout: FunctionComponent<PropsWithChildren> = ({ children }): ReactElement => {
    const siteMetadata = useSiteMetadata();

    return (
        <div className="container mx-auto bg-white px-4">
            <header className="mb-12 mt-6 flex flex-col gap-4 leading-8">
                <nav className="flex flex-col justify-between gap-4 whitespace-nowrap sm:flex-row">
                    <div className="text-2xl font-bold text-gray-900">
                        <InternalLink to="/">{siteMetadata.title}</InternalLink>
                    </div>

                    <div className="flex flex-nowrap gap-6 text-gray-600 sm:gap-10">
                        <InternalLink to="/">Home</InternalLink>
                        <InternalLink to="/blog">Blog</InternalLink>
                        <InternalLink to="/about-me">About me</InternalLink>
                    </div>
                </nav>

                <hr />
            </header>

            <main className="prose max-w-none">{children}</main>

            <footer className="mb-6 mt-16 flex flex-col gap-4">
                <hr />

                <div className="flex flex-col justify-between gap-4 whitespace-nowrap text-gray-700 sm:flex-row">
                    <div className="flex gap-6 sm:gap-10">
                        <div className="flex items-center gap-2">
                            <FiGithub size="18" />
                            <ExternalLink href={siteMetadata.author.social.github}>GitHub</ExternalLink>
                        </div>

                        <div className="flex items-center gap-2">
                            <FiLinkedin size="18" />
                            <ExternalLink href={siteMetadata.author.social.linkedin}>LinkedIn</ExternalLink>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <FiRss size="18" />
                        <ExternalLink href="/rss.xml">RSS Feed</ExternalLink>
                    </div>
                </div>

                <div className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} {siteMetadata.author.name}. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export { Layout };
