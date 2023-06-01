import React from 'react';
import type { FunctionComponent, PropsWithChildren } from 'react';

const DocumentHead: FunctionComponent<PropsWithChildren> = ({ children }) => {
    return (
        <>
            <html lang="en" />

            <meta
                httpEquiv="cache-control"
                content="public, max-age=0, must-revalidate"
            />

            <meta
                name="color-scheme"
                content="light dark"
            />

            {children}
        </>
    );
};

export { DocumentHead };
