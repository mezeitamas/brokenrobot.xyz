import React from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

import { Link } from 'gatsby';

type InternalLinkProps = {
    to: string;
};

const InternalLink: FunctionComponent<PropsWithChildren<InternalLinkProps>> = ({ to, children }) => {
    return (
        <div className="hover:underline">
            <Link to={to}>{children}</Link>
        </div>
    );
};

export { InternalLink };
