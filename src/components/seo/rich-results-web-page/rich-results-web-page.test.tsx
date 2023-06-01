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
                    githubUrl: 'https://github.com/mezeitamas',
                    linkedinUrl: 'https://www.linkedin.com/in/mezeitamas/',
                    twitterUrl: 'https://twitter.com/brokenrobot_xyz',
                    twitterUsername: '@brokenrobot_xyz'
                }
            }
        };

        // When
        const component = create(<RichResultsWebPage {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
