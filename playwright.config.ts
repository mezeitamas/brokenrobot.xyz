import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

export default defineConfig({
    testDir: './tests',
    timeout: 120_000,
    fullyParallel: true,
    forbidOnly: process.env.CI !== undefined,
    retries: process.env.CI !== undefined ? 2 : 0,
    workers: process.env.CI !== undefined ? 1 : undefined,
    reporter: [['list'], ['json'], ['html', { open: 'never' }], ['junit'], ['github']],
    use: {
        baseURL: `http://localhost:${process.env.BROKENROBOT_PORT}`,
        trace: 'on-first-retry'
    },
    projects: [
        {
            name: 'Desktop Chrome',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'Desktop Firefox',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'Desktop Safari',
            use: { ...devices['Desktop Safari'] }
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] }
        }
        /* Mobile Safari tests are failing on GitHub Actions */
        /*
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] }
        }
        */
    ],
    webServer: {
        command: 'npm run serve',
        url: `http://localhost:${process.env.BROKENROBOT_PORT}`,
        reuseExistingServer: process.env.CI === undefined
    }
});
