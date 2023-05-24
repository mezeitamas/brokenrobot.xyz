import React from 'react';

import { create } from 'react-test-renderer';

import { ExternalLink } from './external-link';

describe('<ExternalLink />', () => {
    test('should render', () => {
        // Given

        // When
        const component = create(<ExternalLink href="https://www.brokenrobot.xyz">Broken Robot</ExternalLink>).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
