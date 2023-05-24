import React from 'react';

import { create } from 'react-test-renderer';

import { InternalLink } from './internal-link';

describe('<InternalLink />', () => {
    test('should render', () => {
        // Given

        // When
        const component = create(<InternalLink to="/about-me">About me</InternalLink>).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
