import React from 'react';

import { create } from 'react-test-renderer';

import { Seo } from './seo';
import type { SeoProps } from './seo';

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

describe('<Seo />', () => {
    test('should render without props', () => {
        // Given
        const props: SeoProps = {
            title: undefined,
            description: undefined,
            pathname: undefined
        };

        // When
        const component = create(<Seo {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });

    test('should render with props', () => {
        // Given
        const props: SeoProps = {
            title: 'Hosting a static website on Amazon S3',
            description:
                'Hosting a simple static website on Amazon Web Services (AWS) can be daunting at first, but luckily it’s quite straightforward. One option...',
            pathname: 'hosting-a-static-website-on-amazon-s3'
        };

        // When
        const component = create(<Seo {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
