import React from 'react';
import type { FunctionComponent, ReactElement, PropsWithChildren } from 'react';

const Content: FunctionComponent<PropsWithChildren> = ({ children }): ReactElement => {
    return <main className="prose max-w-none md:prose-lg lg:prose-xl">{children}</main>;
};

export { Content };
