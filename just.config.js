const { task, cleanTask, prettierCheckTask, prettierTask, eslintTask, tscTask, jestTask } = require('just-scripts');

// Clean

task(
    'clean',
    cleanTask({
        paths: ['public', 'reports', '.cache']
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
        files: ['src/**/*.{ts,tsx}', 'gatsby-config.ts'],
        fix: false
    })
);

task(
    'lint:fix',
    eslintTask({
        files: ['src/**/*.{ts,tsx}', 'gatsby-config.ts'],
        fix: true
    })
);

// TypeScript

task('type:check', tscTask());

// Testing

task(
    'test:check',
    jestTask({
        runInBand: false,
        coverage: true,
        updateSnapshot: false
    })
);

task(
    'test:update',
    jestTask({
        runInBand: false,
        coverage: false,
        updateSnapshot: true
    })
);
