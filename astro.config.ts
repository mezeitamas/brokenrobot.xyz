import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';
import { config } from 'dotenv';

config();

export default defineConfig({
    site: 'https://www.brokenrobot.xyz',
    integrations: [mdx(), sitemap(), tailwind({ applyBaseStyles: false })],
    build: {
        inlineStylesheets: 'always'
    },
    server: {
        port: process.env.BROKENROBOT_PORT === undefined ? 4321 : parseInt(process.env.BROKENROBOT_PORT, 10),
        headers: {
            'Content-Security-Policy': `default-src 'none'; child-src 'none'; connect-src 'self'; font-src 'self'; frame-src 'none'; img-src 'self' 'unsafe-inline'; manifest-src 'none'; media-src 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; script-src-attr 'self'; script-src-elem 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; style-src-attr 'self' 'unsafe-inline'; style-src-elem 'self' 'unsafe-inline'; worker-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none';`,
            'Permissions-Policy': `accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), display-capture=(), document-domain=(), encrypted-media=(), gamepad=(), geolocation=(), gyroscope=(), fullscreen=(self), magnetometer=(), microphone=(), midi=(), payment=(), publickey-credentials-get=(), screen-wake-lock=(), serial=(), speaker-selection=(), usb=(), web-share=(), xr-spatial-tracking=()`,
            'Referrer-Policy': `same-origin`,
            'Strict-Transport-Security': `max-age=63072000; includeSubDomains; preload`,
            'X-Content-Type-Options': `nosniff`,
            'X-Frame-Options': `DENY`
        }
    }
});
