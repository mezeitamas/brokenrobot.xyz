import React from 'react';

import { create } from 'react-test-renderer';

import { MetaOgArticle } from './meta-og-article';
import type { MetaOgArticleProps } from './meta-og-article';

describe('<MetaOgArticle />', () => {
    test('should render', () => {
        // Given
        const props: MetaOgArticleProps = {
            siteName: 'Broken Robot',
            title: 'Hosting a static website on Amazon S3',
            description:
                'Hosting a simple static website on Amazon Web Services (AWS) can be daunting at first, but luckily it’s quite straightforward. One option...',
            url: 'https://www.brokenrobot.xyz/blog/hosting-a-static-website-on-amazon-s3/',
            published: '2023-05-04T17:58:32.000Z',
            tags: ['aws', 's3', 'route53', 'staticwebsite', 'hosting'],
            author: 'Tamas Mezei'
        };

        // When
        const component = create(<MetaOgArticle {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
