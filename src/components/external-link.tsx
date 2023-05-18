import React from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

import { FiExternalLink } from 'react-icons/fi';

type ExternalLinkProps = {
    href: string;
};

const ExternalLink: FunctionComponent<PropsWithChildren<ExternalLinkProps>> = ({ href, children }) => {
    return (
        <div className="flex items-center gap-1 hover:underline">
            <a
                href={href}
                target="_blank"
            >
                {children}
            </a>
            <FiExternalLink />
        </div>
    );
};

export { ExternalLink };
