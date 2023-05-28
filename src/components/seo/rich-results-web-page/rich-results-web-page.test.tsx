import React from 'react';

import { create } from 'react-test-renderer';

import { RichResultsWebPage } from './rich-results-web-page';
import type { RichResultsWebPageProps } from './rich-results-web-page';

describe('<RichResultsWebPage />', () => {
    test('should render', () => {
        // Given
        const props: RichResultsWebPageProps = {
            siteName: 'Broken Robot',
            siteUrl: 'https://www.brokenrobot.xyz',
            author: {
                name: 'Tamas Mezei',
                social: {
                    github: 'https://github.com/mezeitamas',
                    linkedin: 'https://www.linkedin.com/in/mezeitamas/'
                }
            }
        };

        // When
        const component = create(<RichResultsWebPage {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
