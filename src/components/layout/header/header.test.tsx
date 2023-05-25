import React from 'react';

import { create } from 'react-test-renderer';

import { Header } from './header';
import type { HeaderProps } from './header';

describe('<Header />', () => {
    test('should render', () => {
        // Given
        const props: HeaderProps = {
            title: 'Broken Robot'
        };

        // When
        const component = create(<Header {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
