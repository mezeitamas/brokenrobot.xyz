import React from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

import { FiExternalLink } from 'react-icons/fi';

type ExternalLinkProps = {
    href: string;
    rel?: string;
};

const ExternalLink: FunctionComponent<PropsWithChildren<ExternalLinkProps>> = ({ href, rel, children }) => {
    return (
        <span className="inline-flex items-center gap-1 hover:underline">
            <a
                href={href}
                target="_blank"
                rel={rel}
            >
                {children}
            </a>
            <FiExternalLink size="14" />
        </span>
    );
};

export { ExternalLink };

export type { ExternalLinkProps };
