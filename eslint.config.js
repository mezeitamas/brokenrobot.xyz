import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginTs from 'typescript-eslint';
// import pluginAstro from 'eslint-plugin-astro';
import pluginTailwind from 'eslint-plugin-tailwindcss';

export default [
    {
        ignores: [
            '**/node_modules/',
            '**/.cache/',
            '**/dist/',
            '**/.astro/',
            '**/reports',
            '**/coverage',
            '**/*.lcov',
            '**/.DS_Store',
            '**/.vscode/',
            '**/.env',
            '**/.env.production',
            'test-results/',
            'playwright-report/',
            'playwright/.cache/',
            '**/npm-debug.log*',
            '**/yarn-debug.log*',
            '**/yarn-error.log*',
            '**/pnpm-debug.log*',
            '**/.terraform/*',
            '**/*.tfstate',
            '**/*.tfstate.*',
            '**/crash.log',
            '**/crash.*.log',
            '**/*.tfvars',
            '**/*.tfvars.json',
            '**/override.tf',
            '**/override.tf.json',
            '**/*_override.tf',
            '**/*_override.tf.json',
            '**/.terraformrc',
            '**/terraform.rc'
        ]
    },
    pluginJs.configs.recommended,
    ...pluginTs.configs.strictTypeChecked,
    // ...pluginAstro.configs.recommended,
    ...pluginTailwind.configs['flat/recommended'],
    {
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    {
        rules: {
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    'ts-ignore': 'allow-with-description',
                    minimumDescriptionLength: 10
                }
            ],

            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: true
                }
            ],

            '@typescript-eslint/method-signature-style': ['error', 'method'],
            '@typescript-eslint/no-confusing-non-null-assertion': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-extra-non-null-assertion': 'error',
            '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/prefer-optional-chain': 'error',

            '@typescript-eslint/strict-boolean-expressions': [
                'error',
                {
                    allowString: false,
                    allowNumber: false,
                    allowNullableObject: false,
                    allowNullableBoolean: false,
                    allowNullableString: false,
                    allowNullableNumber: false,
                    allowAny: false,
                    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false
                }
            ],

            '@typescript-eslint/triple-slash-reference': 'warn'
        }
    }
];
