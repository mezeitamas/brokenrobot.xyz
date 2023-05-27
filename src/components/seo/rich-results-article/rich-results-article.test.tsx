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
            url: 'https://www.brokenrobot.xyz/blog/hosting-a-static-website-on-amazon-s3/',
            published: '2023-05-01T10:10:05.000Z',
            author: 'Tamas Mezei'
        };

        // When
        const component = create(<RichResultsArticle {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
