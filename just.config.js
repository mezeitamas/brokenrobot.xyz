const { task, prettierCheckTask, prettierTask, eslintTask, tscTask } = require('just-scripts');

// Formatting

task(
    'format:check',
    prettierCheckTask({
        files: ['**/*.{js,ts,tsx,json,md}'],
        fix: false
    })
);

task(
    'format:fix',
    prettierTask({
        files: ['**/*.{js,ts,tsx,json,md}'],
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
