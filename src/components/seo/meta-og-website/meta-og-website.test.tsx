import React from 'react';

import { create } from 'react-test-renderer';

import { MetaOgWebsite } from './meta-og-website';
import type { MetaOgWebsiteProps } from './meta-og-website';

describe('<MetaOgWebsite />', () => {
    test('should render', () => {
        // Given
        const props: MetaOgWebsiteProps = {
            siteName: 'Broken Robot',
            title: 'Blog',
            description: 'Blog posts',
            url: 'https://www.brokenrobot.xyz/blog/'
        };

        // When
        const component = create(<MetaOgWebsite {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
