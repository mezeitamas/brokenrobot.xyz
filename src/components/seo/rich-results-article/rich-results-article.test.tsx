import React from 'react';

import { create } from 'react-test-renderer';

import { RichResultsArticle } from './rich-results-article';
import type { RichResultsArticleProps } from './rich-results-article';

describe('<RichResultsArticle />', () => {
    test('should render', () => {
        // Given
        const props: RichResultsArticleProps = {
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
                    github: 'https://github.com/mezeitamas',
                    linkedin: 'https://www.linkedin.com/in/mezeitamas/'
                }
            }
        };

        // When
        const component = create(<RichResultsArticle {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
