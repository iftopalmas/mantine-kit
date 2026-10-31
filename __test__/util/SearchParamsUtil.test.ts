import { describe, expect, test } from '@jest/globals';

import { buildUrl, getSearchParam } from '@/src/util/SearchParamsUtil';

describe('SearchParamsUtil', () => {
    test('returns the value of a parameter', () => {
        expect(getSearchParam({ id: '3' }, 'id')).toBe('3');
    });

    // Next.js gives an array when the parameter repeats in the URL (e.g. "?id=3&id=4").
    test('returns the first value of a repeated parameter', () => {
        expect(getSearchParam({ id: ['3', '4'] }, 'id')).toBe('3');
    });

    test('returns null for an absent parameter', () => {
        expect(getSearchParam({}, 'id')).toBeNull();
        expect(getSearchParam({ id: undefined }, 'id')).toBeNull();
    });

    test('builds the URL only with the parameters that have a value', () => {
        expect(buildUrl('/page', { a: 1, b: 'x', c: undefined, d: null, e: '' })).toBe('/page?a=1&b=x');
    });

    test('builds the URL without a query string when no parameter has a value', () => {
        expect(buildUrl('/page', { a: undefined })).toBe('/page');
    });
});
