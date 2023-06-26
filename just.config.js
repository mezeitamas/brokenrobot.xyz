const { task, cleanTask, prettierCheckTask, prettierTask, eslintTask, tscTask, jestTask } = require('just-scripts');

// Clean

task(
    'clean',
    cleanTask({
        paths: ['public', 'reports', '.cache', 'test-results', 'playwright-report']
    })
);

// Formatting

task(
    'format:check',
    prettierCheckTask({
        files: ['**/*.{js,ts,tsx,json,md,yml,sh}'],
        fix: false
    })
);

task(
    'format:fix',
    prettierTask({
        files: ['**/*.{js,ts,tsx,json,md,yml,sh}'],
        fix: true
    })
);

// Linting

task(
    'lint:check',
    eslintTask({
        files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}', 'gatsby-config.ts', 'playwright.config.ts'],
        fix: false
    })
);

task(
    'lint:fix',
    eslintTask({
        files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}', 'gatsby-config.ts', 'playwright.config.ts'],
        fix: true
    })
);

// TypeScript

task('type:check', tscTask());

// Testing

task(
    'test:unit:check',
    jestTask({
        runInBand: false,
        coverage: true,
        updateSnapshot: false
    })
);

task(
    'test:unit:update',
    jestTask({
        runInBand: false,
        coverage: false,
        updateSnapshot: true
    })
);
