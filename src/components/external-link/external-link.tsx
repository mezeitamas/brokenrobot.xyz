import React from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

import { FiExternalLink } from 'react-icons/fi';

type ExternalLinkProps = {
    href: string;
};

const ExternalLink: FunctionComponent<PropsWithChildren<ExternalLinkProps>> = ({ href, children }) => {
    return (
        <span className="inline-flex items-center gap-1 hover:underline">
            <a
                href={href}
                target="_blank"
            >
                {children}
            </a>
            <FiExternalLink size="14" />
        </span>
    );
};

export { ExternalLink };

export type { ExternalLinkProps };
