import React from 'react';

import { create } from 'react-test-renderer';

import { ExternalLink } from './external-link';
import type { ExternalLinkProps } from './external-link';

describe('<ExternalLink />', () => {
    test('should render', () => {
        // Given
        const props: ExternalLinkProps = {
            href: 'https://www.brokenrobot.xyz'
        };
        const children = 'Broken Robot';

        // When
        const component = create(<ExternalLink {...props}>{children}</ExternalLink>).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });

    test('should render with rel', () => {
        // Given
        const props: ExternalLinkProps = {
            href: 'https://mastodon.social/@brokenrobot_xyz',
            rel: 'me'
        };
        const children = 'Mastodon';

        // When
        const component = create(<ExternalLink {...props}>{children}</ExternalLink>).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
