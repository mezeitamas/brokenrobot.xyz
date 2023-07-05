import React from 'react';

import { create } from 'react-test-renderer';

import { BlogPostList } from './blog-post-list';
import type { BlogPostListProps } from './blog-post-list';

describe('<BlogPostList />', () => {
    test('should render with h2 heading', () => {
        // Given
        const props: BlogPostListProps = {
            posts: [
                {
                    title: 'Advanced static website hosting with Amazon S3 and CloudFront',
                    excerpt:
                        'Today we will dive deep into the world of hosting a static website on Amazon S3 using CloudFront. If you’re looking for a secure, reliable, scalable, cost effective and performant solution, you’ve come to the right place. In this blog post, we’ll...',
                    published: '2023-05-29T18:00:00.000Z',
                    publishedFormatted: 'May 29, 2023',
                    slug: 'advanced-static-website-hosting-with-amazon-s3-and-cloudfront'
                },
                {
                    title: 'Hosting a static website on Amazon S3',
                    excerpt:
                        'Hosting a simple static website on Amazon Web Services (AWS) can be daunting at first, but luckily it’s quite straightforward. One option for hosting a static website on AWS is to use Amazon S3. In this post, we will walk through the steps to host a...',
                    published: '2023-05-04T17:58:32.000Z',
                    publishedFormatted: 'May 4, 2023',
                    slug: 'hosting-a-static-website-on-amazon-s3'
                },
                {
                    title: 'Hello, World!',
                    excerpt:
                        'As a software engineer, I can’t think of a better way to start my blog than with the classic “Hello, World!“. For those unfamiliar with the term, “Hello, World!” is often the first program developers write when learning a new programming language or...',
                    published: '2023-05-01T10:10:05.000Z',
                    publishedFormatted: 'May 1, 2023',
                    slug: 'hello-world'
                }
            ],
            HeadingType: 'h2'
        };

        // When
        const component = create(<BlogPostList {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });

    test('should render with h3 heading', () => {
        // Given
        const props: BlogPostListProps = {
            posts: [
                {
                    title: 'Advanced static website hosting with Amazon S3 and CloudFront',
                    excerpt:
                        'Today we will dive deep into the world of hosting a static website on Amazon S3 using CloudFront. If you’re looking for a secure, reliable, scalable, cost effective and performant solution, you’ve come to the right place. In this blog post, we’ll...',
                    published: '2023-05-29T18:00:00.000Z',
                    publishedFormatted: 'May 29, 2023',
                    slug: 'advanced-static-website-hosting-with-amazon-s3-and-cloudfront'
                },
                {
                    title: 'Hosting a static website on Amazon S3',
                    excerpt:
                        'Hosting a simple static website on Amazon Web Services (AWS) can be daunting at first, but luckily it’s quite straightforward. One option for hosting a static website on AWS is to use Amazon S3. In this post, we will walk through the steps to host a...',
                    published: '2023-05-04T17:58:32.000Z',
                    publishedFormatted: 'May 4, 2023',
                    slug: 'hosting-a-static-website-on-amazon-s3'
                },
                {
                    title: 'Hello, World!',
                    excerpt:
                        'As a software engineer, I can’t think of a better way to start my blog than with the classic “Hello, World!“. For those unfamiliar with the term, “Hello, World!” is often the first program developers write when learning a new programming language or...',
                    published: '2023-05-01T10:10:05.000Z',
                    publishedFormatted: 'May 1, 2023',
                    slug: 'hello-world'
                }
            ],
            HeadingType: 'h3'
        };

        // When
        const component = create(<BlogPostList {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
