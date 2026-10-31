/**
 * @jest-environment node
 */
import { readdirSync, readFileSync } from 'fs';
import { dirname, join, normalize } from 'path';

import { describe, expect, test } from '@jest/globals';

/**
 * Checks the isolation of the modules with optional dependencies: an app that does not import the files of a module
 * (e.g. `export/`) must not load it nor need its dependencies (e.g. ExcelJS). Since there are no barrel files, this holds
 * as long as no other module imports them at runtime. Type-only imports (`import type`) are removed by the build.
 */

/** Source files of the library, relative to the repository root. */
const SOURCE_FILES = readdirSync('src', { recursive: true, encoding: 'utf8' })
    .filter(file => /\.tsx?$/.test(file) && !file.endsWith('.d.ts'))
    .map(file => join('src', file));

/** An import of a source file that is kept at runtime (not a type-only import). */
type RuntimeImport = { file: string; specifier: string; dynamic: boolean };

/** Static imports, except `import type`; group 1 is the module specifier. */
const STATIC_IMPORT = /^import\s+(?!type\s)[^;]*?from\s+'([^']+)'/gms;

/** Dynamic imports (`import('x')`) not used only as types (`typeof import('x')`); group 1 is the module specifier. */
const DYNAMIC_IMPORT = /(?<!typeof\s)import\('([^']+)'\)/g;

/**
 * Returns the runtime imports of every source file, with the relative specifiers resolved from the repository root.
 */
function runtimeImports(): RuntimeImport[] {
    return SOURCE_FILES.flatMap(file => {
        const code = readFileSync(file, 'utf8');
        const resolve = (specifier: string) =>
            specifier.startsWith('.') ? normalize(join(dirname(file), specifier)) : specifier;

        return [
            ...[...code.matchAll(STATIC_IMPORT)].map(match => ({ file, specifier: resolve(match[1]), dynamic: false })),
            ...[...code.matchAll(DYNAMIC_IMPORT)].map(match => ({ file, specifier: resolve(match[1]), dynamic: true }))
        ];
    });
}

/**
 * Returns the files outside the allowed paths that import, at runtime, a module matched by the given test.
 * @param allowed folders or files allowed to import the module
 * @param imports whether a specifier is the module
 */
function importersOutside(allowed: string | string[], imports: (specifier: string) => boolean): string[] {
    const paths = Array.isArray(allowed) ? allowed : [allowed];

    return runtimeImports()
        .filter(({ file, specifier }) => imports(specifier) && !paths.some(path => file.startsWith(path)))
        .map(({ file, specifier }) => `${file} -> ${specifier}`);
}

describe('module isolation', () => {
    test.each([
        ['src/export/', 'the export module'],
        ['src/http/', 'the HTTP client']
    ])('only %s imports %s at runtime', folder => {
        expect(importersOutside(folder, specifier => specifier.startsWith(folder))).toEqual([]);
    });

    /* The optional peer dependencies are listed in the README with the components that need them: these are the only
       files allowed to import them at runtime, so the list stays true. */
    test.each([
        ['axios', ['src/http/']],
        ['exceljs', ['src/export/xlsx/']],
        ['echarts', ['src/component/organism/EChart/']],
        ['@mantine/dates', ['src/component/atom/DateField/']],
        ['@mantine/modals', ['src/component/organism/DataForm/', 'src/component/organism/Table/RowActions.tsx']],
        ['@mantine/form', []],
        ['zod', ['src/util/ValidationUtil.ts']]
    ])('only the files that need %s import it', (dependency, allowed) => {
        expect(importersOutside(allowed, specifier => specifier === dependency)).toEqual([]);
    });

    // A static import would put the whole library in the bundle of every page that may show a chart or export a file.
    test.each(['echarts', 'exceljs'])('%s is loaded only on demand (dynamic import)', dependency => {
        const staticImports = runtimeImports().filter(({ specifier, dynamic }) => specifier === dependency && !dynamic);
        expect(staticImports).toEqual([]);
    });
});
