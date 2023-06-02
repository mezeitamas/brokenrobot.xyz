import React from 'react';

import { create } from 'react-test-renderer';

import type { SiteMetadata } from '../site-metadata/site-metadata.types';

import { SeoWebPage } from './seo-web-page';
import type { SeoWebPageProps } from './seo-web-page';

jest.mock('../site-metadata/use-site-metadata', () => {
    return {
        useSiteMetadata: jest.fn().mockImplementation((): SiteMetadata => {
            return {
                title: 'Broken Robot',
                description:
                    'Personal website and blog of Tamas Mezei. Welcome to my little corner of the web, where I share my professional experiences, thoughts, adventures, and projects with the world.',
                siteUrl: 'https://www.brokenrobot.xyz',
                author: {
                    name: 'Tamas Mezei',
                    social: {
                        githubUrl: 'https://github.com/mezeitamas',
                        linkedinUrl: 'https://www.linkedin.com/in/mezeitamas/',
                        mastodonUrl: 'https://mastodon.social/@brokenrobot_xyz',
                        mastodonUsername: '@brokenrobot_xyz@mastodon.social',
                        twitterUrl: 'https://twitter.com/brokenrobot_xyz',
                        twitterUsername: '@brokenrobot_xyz'
                    }
                }
            };
        })
    };
});

describe('<SeoWebPage />', () => {
    test('should render', () => {
        // Given
        const props: SeoWebPageProps = {
            title: 'Broken Robot',
            description:
                'Personal website and blog of Tamas Mezei. Welcome to my little corner of the web, where I share my professional experiences, thoughts, adventures, and projects with the world.',
            pathname: ''
        };

        // When
        const component = create(<SeoWebPage {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
