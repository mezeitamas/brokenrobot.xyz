import React from 'react';

import { create } from 'react-test-renderer';

import { BlogPostListItem } from './blog-post-list-item';
import type { BlogPostListItemProps } from './blog-post-list-item';

describe('<BlogPostListItem />', () => {
    test('should render with h2 heading', () => {
        // Given
        const props: BlogPostListItemProps = {
            title: 'Advanced static website hosting with Amazon S3 and CloudFront',
            excerpt:
                'Today we will dive deep into the world of hosting a static website on Amazon S3 using CloudFront. If you’re looking for a secure, reliable, scalable, cost effective and performant solution, you’ve come to the right place. In this blog post, we’ll...',
            published: '2023-05-29T18:00:00.000Z',
            publishedFormatted: 'May 29, 2023',
            slug: 'advanced-static-website-hosting-with-amazon-s3-and-cloudfront',
            HeadingType: 'h2'
        };

        // When
        const component = create(<BlogPostListItem {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });

    test('should render with h3 heading', () => {
        // Given
        const props: BlogPostListItemProps = {
            title: 'Advanced static website hosting with Amazon S3 and CloudFront',
            excerpt:
                'Today we will dive deep into the world of hosting a static website on Amazon S3 using CloudFront. If you’re looking for a secure, reliable, scalable, cost effective and performant solution, you’ve come to the right place. In this blog post, we’ll...',
            published: '2023-05-29T18:00:00.000Z',
            publishedFormatted: 'May 29, 2023',
            slug: 'advanced-static-website-hosting-with-amazon-s3-and-cloudfront',
            HeadingType: 'h3'
        };

        // When
        const component = create(<BlogPostListItem {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
