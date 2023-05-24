module.exports = {
    bail: false,

    automock: false,
    clearMocks: false,

    // Coverage
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.test.{ts,tsx}', '!src/gatsby-types.d.ts'],
    coverageDirectory: 'reports/coverage',
    coveragePathIgnorePatterns: ['/node_modules/'],
    coverageProvider: 'babel',
    coverageReporters: ['json', 'text', 'lcov', 'clover'],
    coverageThreshold: undefined,

    transform: {
        '^.+\\.[jt]sx?$': '<rootDir>/jest-preprocess.js'
    },
    moduleNameMapper: {
        '.+\\.(css|styl|less|sass|scss)$': 'identity-obj-proxy',
        '.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/__mocks__/file-mock.js'
    },
    testPathIgnorePatterns: ['node_modules', '\\.cache', '<rootDir>.*/public'],
    transformIgnorePatterns: ['node_modules/(?!(gatsby|gatsby-script|gatsby-link)/)'],
    globals: {
        __PATH_PREFIX__: ''
    },

    // Test environment
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {},

    // Setup files
    setupFiles: ['<rootDir>/loadershim.js'],
    setupFilesAfterEnv: ['<rootDir>/setup-test-env.js']
};
