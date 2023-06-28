import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: process.env.CI !== undefined,
    retries: process.env.CI !== undefined ? 2 : 0,
    workers: process.env.CI !== undefined ? 1 : undefined,
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
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] }
        }
    ],
    webServer: {
        command: 'npm run build && npm run serve',
        timeout: 120_000,
        url: `http://localhost:${process.env.BROKENROBOT_PORT}`,
        reuseExistingServer: process.env.CI === undefined
    }
});
