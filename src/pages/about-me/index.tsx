import React from 'react';
import type { FunctionComponent, ReactElement } from 'react';

import type { HeadFC } from 'gatsby';

import { ExternalLink } from '../../components/external-link';
import { InternalLink } from '../../components/internal-link';
import { Layout } from '../../components/layout';
import { Seo } from '../../components/seo';

const AboutMePage: FunctionComponent = (): ReactElement => {
    return (
        <Layout>
            <section>
                <h2>About me</h2>

                <p>
                    Hello there, my name is Tamas Mezei! I work as a software engineer / architect in Zürich,
                    Switzerland.
                </p>

                <p>
                    From my early days tinkering with computers and programming languages to my years of professional
                    experience in the field, I have come to appreciate the power of software to transform lives and
                    businesses. As the web and cloud have become increasingly important and ubiquitous, I have focused
                    my attention on mastering these technologies and exploring their potential to create scalable,
                    secure, and user-friendly solutions.
                </p>

                <p>
                    Through this website, I hope to not only showcase my work and expertise but also contribute to the
                    wider software development community. I believe in the power of collaboration, open source, and
                    continuous learning, and I hope my <InternalLink to="/blog">blog posts</InternalLink> and other
                    content will inspire others in their own journeys.
                </p>

                <p>
                    I'm also a firm believer in making the internet a better place, that's why I've created a website
                    that's simple, clean, and free from all the annoying distractions that plague the internet these
                    days.
                </p>

                <p>
                    Being said that you won't find any ads, affiliate links, or spyware here, just pure unadulterated
                    content.
                </p>

                <p>
                    I hope you enjoy exploring my website, and if you have any questions or comments, feel free to reach
                    out to me. And let's make the internet a more awesome place, one byte at a time!
                </p>
            </section>

            <section>
                <h2>About this website</h2>

                <p>
                    I like to think of this website as my own little digital playground. The current version of the
                    website is a minimum viable product (MVP) and represents an initial step towards my ultimate vision.
                    I aim to maintain a minimalistic approach and only introduce new features or modifications when they
                    are truly necessary.
                </p>

                <p>
                    I'll be documenting any improvements or modifications to the website through blog posts that will be
                    published on this site.
                </p>

                <p>
                    The website's source code is available on{' '}
                    <ExternalLink href="https://github.com/mezeitamas/brokenrobot.xyz">GitHub</ExternalLink>. Please
                    don't hesitate to create an{' '}
                    <ExternalLink href="https://github.com/mezeitamas/brokenrobot.xyz/issues">issue</ExternalLink> if
                    you encounter a bug or typo, or if you have any suggestions to offer.
                </p>
            </section>
        </Layout>
    );
};

export default AboutMePage;

export const Head: HeadFC = () => <Seo title="About me" />;
