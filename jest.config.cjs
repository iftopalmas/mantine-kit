/** Jest configuration: transpiles TypeScript/JSX with SWC, which does not depend on the TypeScript compiler API. */
module.exports = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
    testEnvironment: 'jest-environment-jsdom',
    transform: {
        '^.+\\.(t|j)sx?$': [
            '@swc/jest',
            { jsc: { transform: { react: { runtime: 'automatic' } } }, module: { type: 'commonjs' } }
        ]
    },
    moduleNameMapper: {
        '\\.module\\.css$': 'identity-obj-proxy',
        '\\.css$': 'identity-obj-proxy',
        '^@/(.*)$': '<rootDir>/$1'
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
    coverageThreshold: { global: { lines: 80 } },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/']
};
