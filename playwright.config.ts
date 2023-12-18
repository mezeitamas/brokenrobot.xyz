import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: process.env.CI !== undefined,
    retries: 0,
    workers: 1,
    outputDir: 'reports/tests/e2e/test-results',
    reporter: [
        ['list'],
        ['html', { outputFolder: 'reports/tests/e2e/html', open: 'never' }],
        ['json', { outputFile: 'reports/tests/e2e/json/test-results.json' }],
        ['junit', { outputFile: 'reports/tests/e2e/junit/test-results.xml' }],
        ['github']
    ],
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
            name: 'Mobile Chrome - Pixel 5',
            use: { ...devices['Pixel 5'] }
        },
        {
            name: 'Mobile Safari - iPhone 14',
            use: { ...devices['iPhone 14'] }
        }
    ],
    webServer: {
        command: 'npm run serve',
        timeout: 60_000,
        url: `http://localhost:${process.env.BROKENROBOT_PORT}`,
        reuseExistingServer: process.env.CI === undefined
    }
});
