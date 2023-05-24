import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { FiRss, FiGithub, FiLinkedin } from 'react-icons/fi';

import { ExternalLink } from '../../external-link/external-link';

type FooterProps = {
    githubLink: string;
    linkedinLink: string;
    authorName: string;
};

const Footer: FunctionComponent<FooterProps> = ({ githubLink, linkedinLink, authorName }): ReactElement => {
    return (
        <footer className="mb-6 mt-16 flex flex-col gap-4">
            <hr />

            <div className="flex flex-col justify-between gap-4 whitespace-nowrap text-gray-700 sm:flex-row">
                <div className="flex gap-6 sm:gap-10">
                    <div className="flex items-center gap-2">
                        <FiGithub size="18" />
                        <ExternalLink href={githubLink}>GitHub</ExternalLink>
                    </div>

                    <div className="flex items-center gap-2">
                        <FiLinkedin size="18" />
                        <ExternalLink href={linkedinLink}>LinkedIn</ExternalLink>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <FiRss size="18" />
                    <ExternalLink href="/rss.xml">RSS Feed</ExternalLink>
                </div>
            </div>

            <div className="text-sm text-gray-400">&copy; 2023 {authorName}. All rights reserved.</div>
        </footer>
    );
};

export { Footer };

export type { FooterProps };
