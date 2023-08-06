import React from 'react';
import type { ReactElement } from 'react';

import type { GatsbyBrowser } from 'gatsby';

import { Layout } from './src/components/layout/layout';

import './src/styles/global.css';
import 'prismjs/themes/prism-tomorrow.css';

const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({ element, props }): ReactElement => {
    return <Layout {...props}>{element}</Layout>;
};

export { wrapPageElement };
