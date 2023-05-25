import React from 'react';
import type { FunctionComponent, ReactElement, PropsWithChildren } from 'react';

const Content: FunctionComponent<PropsWithChildren> = ({ children }): ReactElement => {
    return <main className="prose max-w-none">{children}</main>;
};

export { Content };
