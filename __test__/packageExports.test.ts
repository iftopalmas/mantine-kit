/**
 * @jest-environment node
 */
import { readFileSync } from 'fs';

import { describe, expect, test } from '@jest/globals';

const { exports: packageExports } = JSON.parse(readFileSync('package.json', 'utf8'));

describe('exports of package.json', () => {
    /* Jest resolves packages with the "require" and "default" conditions, so without "default" deep imports fail in apps. */
    test('deep imports have a default condition, as the last one, pointing to the same file as import', () => {
        const conditions = packageExports['./*'];

        expect(Object.keys(conditions).at(-1)).toBe('default');
        expect(conditions.default).toBe(conditions.import);
    });
});
