import React from 'react';

import { create } from 'react-test-renderer';

import { SeoBlogPosting } from './seo-blog-posting';
import type { SeoBlogPostingProps } from './seo-blog-posting';

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

describe('<SeoBlogPosting />', () => {
    test('should render', () => {
        // Given
        const props: SeoBlogPostingProps = {
            title: 'Hosting a static website on Amazon S3',
            description:
                'Hosting a simple static website on Amazon Web Services (AWS) can be daunting at first, but luckily it’s quite straightforward. One option...',
            pathname: '/blog/hosting-a-static-website-on-amazon-s3/',
            published: '2023-05-04T17:58:32.000Z',
            tags: ['aws', 's3', 'route53', 'staticwebsite', 'hosting']
        };

        // When
        const component = create(<SeoBlogPosting {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
