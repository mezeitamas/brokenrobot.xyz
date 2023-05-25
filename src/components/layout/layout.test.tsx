import React from 'react';
import type { PropsWithChildren } from 'react';

import { create } from 'react-test-renderer';

import { Layout } from './layout';

jest.mock('../../hooks/use-site-metadata', () => {
    return {
        useSiteMetadata: jest.fn().mockImplementation(() => {
            return {
                title: 'Broken Robot',
                description:
                    'Personal website and blog of Tamas Mezei. Welcome to my little corner of the web, where I share my professional experiences, thoughts, adventures, and projects with the world.',
                siteUrl: 'https://www.brokenrobot.xyz',
                author: {
                    name: 'Tamas Mezei',
                    social: {
                        github: 'https://github.com/mezeitamas',
                        linkedin: 'https://www.linkedin.com/in/mezeitamas/'
                    }
                }
            };
        })
    };
});

describe('<Layout />', () => {
    test('should render', () => {
        // Given
        const props: PropsWithChildren = {
            children: <div>Content</div>
        };

        // When
        const component = create(<Layout {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
