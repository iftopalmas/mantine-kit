import tsEslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import parser from '@typescript-eslint/parser';
import hooksPlugin from 'eslint-plugin-react-hooks';
import noCycleConfig from './eslint.no-cycle.config.js';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    // Global ignores (must be the first item)
    {
        ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.yarn/**']
    },

    {
        name: 'Parser TypeScript/JSX',
        languageOptions: {
            parser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        files: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.ts', '**/*.tsx']
    },

    ...tsEslint.configs.recommended,
    {
        rules: {
            /*
            Allows expressions such as `condition && functionCall()`, a short way to call a function only when a
            condition is true, widely used to render components conditionally in React with JSX. The rule would report
            them as unused expressions ("Expected an assignment or function call and instead saw an expression").
            */
            '@typescript-eslint/no-unused-expressions': 'off'
        }
    },
    {
        name: 'Explicit types of function parameters and return values',
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            /*
            Declared functions and methods always declare their return type, but arrow functions declare it only when
            it is not obvious (e.g. `const isDarkMode = () => colorScheme === 'dark'`). The
            explicit-function-return-type and explicit-module-boundary-types rules have no option to exempt arrow
            functions assigned to a constant, so they are off, and the return type is required by no-restricted-syntax
            only where it is mandatory. Parameters without a type are still reported by the typedef below and, in arrow
            functions, by the `strict` mode of TypeScript (noImplicitAny).
            */
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/typedef': ['error', { parameter: true, arrowParameter: false }],
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'FunctionDeclaration:not([returnType])',
                    message:
                        'Declare the return type of the function (only arrow functions may omit it when it is obvious).'
                },
                {
                    selector: 'MethodDefinition[kind=/^(method|get)$/] > FunctionExpression:not([returnType])',
                    message: 'Declare the return type of the method.'
                },
                {
                    selector: 'Property[method=true] > FunctionExpression:not([returnType])',
                    message: 'Declare the return type of the method.'
                },
                {
                    selector: 'VariableDeclarator > FunctionExpression:not([returnType])',
                    message:
                        'Declare the return type of the function (or use an arrow function if the type is obvious).'
                }
            ]
        }
    },
    ...noCycleConfig,
    {
        plugins: {
            'react-hooks': hooksPlugin
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            ...hooksPlugin.configs.recommended.rules
        },
        ignores: ['*.test.tsx']
    },
    pluginReact.configs.flat['jsx-runtime']
];
