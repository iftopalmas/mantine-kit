// Check of circular imports, in its own file so it can also run alone. eslint.config.js includes this config.

import parser from '@typescript-eslint/parser';
import pluginImport from 'eslint-plugin-import';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    {
        name: 'Imports without cycles',
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: { parser },
        plugins: {
            import: pluginImport
        },
        settings: {
            // Without it, the plugin cannot read the imported files and finds no cycle
            'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
            // Resolves the "@/" alias of tsconfig.json
            'import/resolver': { typescript: { project: './tsconfig.json' } }
        },
        rules: {
            /*
            Circular imports make tsc check (and the bundler load) unrelated modules, which is what barrel files
            (index.ts) cause. Always import from the file that defines the symbol.
            */
            'import/no-cycle': 'error'
        }
    }
];
