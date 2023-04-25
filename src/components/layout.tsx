import React from 'react';
import type { FunctionComponent, ReactElement, PropsWithChildren } from 'react';

import { Link } from 'gatsby';

import { useSiteMetadata } from '../hooks/use-site-metadata';

const Layout: FunctionComponent<PropsWithChildren> = ({ children }): ReactElement => {
    const siteMetadata = useSiteMetadata();

    return (
        <div className="container mx-auto bg-white px-4">
            <header className="mb-12 mt-6 flex flex-col gap-4 leading-8">
                <nav className="flex flex-col justify-between gap-4 whitespace-nowrap sm:flex-row">
                    <div className="text-2xl font-bold text-gray-900">
                        <Link to="/">{siteMetadata.title}</Link>
                    </div>

                    <div className="flex flex-nowrap gap-10 text-gray-600">
                        <Link to="/">Home</Link>
                        <Link to="/blog">Blog</Link>
                        <Link to="/about-me">About me</Link>
                    </div>
                </nav>

                <hr />
            </header>

            <main className="prose max-w-none">{children}</main>

            <footer className="mb-6 mt-16 flex flex-col gap-4">
                <hr />

                <div className="flex gap-4 text-gray-700">
                    <a href={siteMetadata.author.social.github}>GitHub</a>
                    <a href={siteMetadata.author.social.linkedin}>LinkedIn</a>
                </div>

                <div className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} {siteMetadata.author.name}. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export { Layout };
