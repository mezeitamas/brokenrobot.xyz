import React from 'react';

import { create } from 'react-test-renderer';

import { Footer } from './footer';
import type { FooterProps } from './footer';

describe('<Footer />', () => {
    test('should render', () => {
        // Given
        const props: FooterProps = {
            githubLink: 'https://github.com/mezeitamas',
            linkedinLink: 'https://www.linkedin.com/in/mezeitamas/',
            mastodonLink: 'https://mastodon.social/@brokenrobot_xyz',
            twitterLink: 'https://twitter.com/brokenrobot_xyz',
            authorName: 'Tamas Mezei'
        };

        // When
        const component = create(<Footer {...props} />).toJSON();

        // Then
        expect(component).toMatchSnapshot();
    });
});
