import React from 'react';

import { create } from 'react-test-renderer';

import { MetaTwitter } from './meta-twitter';
import type { MetaTwitterProps } from './meta-twitter';

describe('<MetaTwitter />', () => {
    test('should render', () => {
        // Given
        const props: MetaTwitterProps = {
            title: 'Hosting a static website on Amazon S3',
            description:
                'Hosting a simple static website on Amazon Web Services (AWS) can be daunting at first, but luckily it’s quite straightforward. One option...',
            url: 'https://www.brokenrobot.xyz/blog/hosting-a-static-website-on-amazon-s3/'
        };

        // When
        const component = create(<MetaTwitter {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
