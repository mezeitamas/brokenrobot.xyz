import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

export default defineConfig({
    testDir: './tests',
    snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{-projectName}{ext}',
    expect: {
        timeout: 10_000,
        toPass: {
            timeout: 15_000
        },
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.1,
            stylePath: './tests/screenshot.css'
        }
    },
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
        // Desktop browsers
        {
            name: 'Desktop Chrome',
            use: { ...devices['Desktop Chrome'] }
        },
        {
            name: 'Desktop Edge',
            use: { ...devices['Desktop Edge'] }
        },
        {
            name: 'Desktop Firefox',
            use: { ...devices['Desktop Firefox'] }
        },
        {
            name: 'Desktop Safari',
            use: { ...devices['Desktop Safari'] }
        },

        // Tablet browsers
        {
            name: 'iPad Pro 11',
            use: { ...devices['iPad Pro 11'] }
        },
        {
            name: 'iPad Pro 11 landscape',
            use: { ...devices['iPad Pro 11 landscape'] }
        },

        // Mobile browsers
        {
            name: 'Pixel 7',
            use: { ...devices['Pixel 7'] }
        },
        {
            name: 'Pixel 7 landscape',
            use: { ...devices['Pixel 7 landscape'] }
        },
        {
            name: 'iPhone 12 Pro',
            use: { ...devices['iPhone 12 Pro'] }
        },
        {
            name: 'iPhone 12 Pro landscape',
            use: { ...devices['iPhone 12 Pro landscape'] }
        }
    ],
    webServer: {
        command: 'npm run serve',
        timeout: 60_000,
        url: `http://localhost:${process.env.BROKENROBOT_PORT}`,
        reuseExistingServer: process.env.CI === undefined
    }
});
