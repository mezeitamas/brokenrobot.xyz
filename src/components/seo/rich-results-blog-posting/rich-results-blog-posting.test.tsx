import React from 'react';

import { create } from 'react-test-renderer';

import { RichResultsBlogPosting } from './rich-results-blog-posting';
import type { RichResultsBlogPostingProps } from './rich-results-blog-posting';

describe('<RichResultsBlogPosting />', () => {
    test('should render', () => {
        // Given
        const props: RichResultsBlogPostingProps = {
            siteName: 'Broken Robot',
            siteUrl: 'https://www.brokenrobot.xyz',
            title: 'Hosting a static website on Amazon S3',
            description:
                'Hosting a simple static website on Amazon Web Services (AWS) can be daunting at first, but luckily it’s quite straightforward. One option...',
            url: 'https://www.brokenrobot.xyz/blog/hosting-a-static-website-on-amazon-s3/',
            published: '2023-05-01T10:10:05.000Z',
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
        const component = create(<RichResultsBlogPosting {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
