import React from 'react';

import { create } from 'react-test-renderer';

import { InternalLink } from './internal-link';
import type { InternalLinkProps } from './internal-link';

describe('<InternalLink />', () => {
    test('should render', () => {
        // Given
        const props: InternalLinkProps = {
            to: '/about-me'
        };
        const children = 'About me';

        // When
        const component = create(<InternalLink {...props}>{children}</InternalLink>).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
