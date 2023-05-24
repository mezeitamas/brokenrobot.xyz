import React from 'react';
import type { PropsWithChildren } from 'react';

import { create } from 'react-test-renderer';

import { Content } from './content';

describe('<Content />', () => {
    test('should render', () => {
        // Given
        const props: PropsWithChildren = {
            children: <div>Content</div>
        };

        // When
        const component = create(<Content {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
