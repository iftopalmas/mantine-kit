import { describe, expect, test } from '@jest/globals';

import { isPlainObject, mergeDeep } from '@/src/util/ObjectUtil';

/** Checks which values are plain objects, the only ones mergeDeep merges recursively. */
describe('isPlainObject', () => {
    test('returns true only for plain objects', () => {
        expect(isPlainObject({})).toBe(true);
        expect(isPlainObject({ a: 1 })).toBe(true);
        expect(isPlainObject([])).toBe(false);
        expect(isPlainObject(null)).toBe(false);
        expect(isPlainObject(new Date())).toBe(false);
        expect(isPlainObject('text')).toBe(false);
    });
});

/** Checks the deep merge used to apply the chart option over the default values. */
describe('mergeDeep', () => {
    test('merges nested objects, giving priority to the override values', () => {
        const base: { a: number; nested: { x?: number; y?: number } } = { a: 1, nested: { x: 1, y: 2 } };

        expect(mergeDeep(base, { nested: { y: 3 } })).toEqual({ a: 1, nested: { x: 1, y: 3 } });
    });

    test('replaces arrays instead of merging them', () => {
        expect(mergeDeep({ list: [1, 2, 3] }, { list: [9] })).toEqual({ list: [9] });
    });

    test('ignores undefined attributes of the override', () => {
        expect(mergeDeep({ a: 1 }, { a: undefined })).toEqual({ a: 1 });
    });

    test('does not change the original objects', () => {
        const base = { nested: { x: 1 } };
        const override = { nested: { x: 2 } };

        mergeDeep(base, override);

        expect(base).toEqual({ nested: { x: 1 } });
        expect(override).toEqual({ nested: { x: 2 } });
    });
});
