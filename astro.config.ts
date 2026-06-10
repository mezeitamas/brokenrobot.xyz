import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { config } from 'dotenv';

import { remarkReadingTimePlugin } from './src/utils/remarkReadingTimePlugin';

config();

export default defineConfig({
    site: 'https://www.brokenrobot.xyz',
    integrations: [preact(), mdx(), sitemap()],
    compressHTML: true,
    build: {
        inlineStylesheets: 'always'
    },
    image: {
        responsiveStyles: true
    },
    fonts: [
        {
            provider: fontProviders.npm({ remote: false }),
            name: 'Space Grotesk',
            cssVariable: '--font-space-grotesk',
            weights: [400, 500, 600, 700],
            styles: ['normal'],
            subsets: ['latin'],
            fallbacks: ['system-ui', 'sans-serif'],
            options: { package: '@fontsource/space-grotesk', file: 'latin.css' }
        },
        {
            provider: fontProviders.npm({ remote: false }),
            name: 'Newsreader',
            cssVariable: '--font-newsreader',
            weights: [400, 500, 600],
            styles: ['normal'],
            subsets: ['latin'],
            fallbacks: ['Georgia', 'serif'],
            options: { package: '@fontsource/newsreader', file: 'latin.css' }
        },
        {
            provider: fontProviders.npm({ remote: false }),
            name: 'Newsreader',
            cssVariable: '--font-newsreader',
            weights: [400],
            styles: ['italic'],
            subsets: ['latin'],
            fallbacks: ['Georgia', 'serif'],
            options: { package: '@fontsource/newsreader', file: 'latin-400-italic.css' }
        },
        {
            provider: fontProviders.npm({ remote: false }),
            name: 'Space Mono',
            cssVariable: '--font-space-mono',
            weights: [400, 700],
            styles: ['normal'],
            subsets: ['latin'],
            fallbacks: ['ui-monospace', 'monospace'],
            options: { package: '@fontsource/space-mono', file: 'latin.css' }
        },
        {
            provider: fontProviders.npm({ remote: false }),
            name: 'Space Mono',
            cssVariable: '--font-space-mono',
            weights: [400],
            styles: ['italic'],
            subsets: ['latin'],
            fallbacks: ['ui-monospace', 'monospace'],
            options: { package: '@fontsource/space-mono', file: 'latin-400-italic.css' }
        }
    ],
    markdown: {
        remarkPlugins: [remarkReadingTimePlugin]
    },
    server: {
        port: process.env.BROKENROBOT_PORT === undefined ? 4321 : parseInt(process.env.BROKENROBOT_PORT, 10),
        headers: {
            'Cache-Control': `public, max-age=0, must-revalidate`,
            'Content-Security-Policy': `default-src 'none'; child-src 'none'; connect-src 'self'; font-src 'self'; frame-src 'none'; img-src 'self' 'unsafe-inline'; manifest-src 'none'; media-src 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; script-src-attr 'self'; script-src-elem 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; style-src-attr 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline'; worker-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none';`,
            'Permissions-Policy': `accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), display-capture=(), document-domain=(), encrypted-media=(), gamepad=(), geolocation=(), gyroscope=(), fullscreen=(self), magnetometer=(), microphone=(), midi=(), payment=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), speaker-selection=(), usb=(), web-share=(), xr-spatial-tracking=()`,
            'Referrer-Policy': `same-origin`,
            'Strict-Transport-Security': `max-age=63072000; includeSubDomains; preload`,
            'X-Content-Type-Options': `nosniff`,
            'X-Frame-Options': `DENY`
        }
    }
});
