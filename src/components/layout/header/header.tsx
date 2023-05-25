import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { InternalLink } from '../../internal-link/internal-link';

type HeaderProps = {
    title: string;
};

const Header: FunctionComponent<HeaderProps> = ({ title }): ReactElement => {
    return (
        <header className="mb-12 mt-6 flex flex-col gap-4 leading-8">
            <nav className="flex flex-col justify-between gap-4 whitespace-nowrap sm:flex-row">
                <div className="text-2xl font-bold text-gray-900">
                    <InternalLink to="/">{title}</InternalLink>
                </div>

                <div className="flex flex-nowrap gap-6 text-gray-600 sm:gap-10">
                    <InternalLink to="/">Home</InternalLink>
                    <InternalLink to="/blog">Blog</InternalLink>
                    <InternalLink to="/about-me">About me</InternalLink>
                </div>
            </nav>

            <hr />
        </header>
    );
};

export { Header };

export type { HeaderProps };
