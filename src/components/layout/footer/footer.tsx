import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import { FiRss, FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import { TbBrandMastodon } from 'react-icons/tb';

import { ExternalLink } from '../../external-link/external-link';
import { InternalLink } from '../../internal-link/internal-link';

type FooterProps = {
    githubLink: string;
    linkedinLink: string;
    mastodonLink: string;
    twitterLink: string;
    authorName: string;
};

const Footer: FunctionComponent<FooterProps> = ({
    githubLink,
    linkedinLink,
    mastodonLink,
    twitterLink,
    authorName
}): ReactElement => {
    return (
        <footer className="mb-6 mt-12 flex flex-col gap-4 text-gray-600">
            <hr />

            <div className="flex flex-col justify-between gap-6 whitespace-nowrap sm:flex-row sm:gap-10">
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex flex-row gap-4">
                        <div className="flex items-center gap-2">
                            <FiGithub size="18" />
                            <ExternalLink href={githubLink}>GitHub</ExternalLink>
                        </div>

                        <div className="flex items-center gap-2">
                            <FiLinkedin size="18" />
                            <ExternalLink href={linkedinLink}>LinkedIn</ExternalLink>
                        </div>
                    </div>

                    <div className="flex flex-row gap-4">
                        <div className="flex items-center gap-2">
                            <TbBrandMastodon size="18" />
                            <ExternalLink
                                href={mastodonLink}
                                rel="me"
                            >
                                Mastodon
                            </ExternalLink>
                        </div>

                        <div className="flex items-center gap-2">
                            <FiTwitter size="18" />
                            <ExternalLink href={twitterLink}>Twitter</ExternalLink>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <FiRss size="18" />
                    <InternalLink to="/rss.xml">RSS Feed</InternalLink>
                </div>
            </div>

            <div className="text-sm">&copy; 2023 {authorName}. All rights reserved.</div>
        </footer>
    );
};

export { Footer };

export type { FooterProps };
