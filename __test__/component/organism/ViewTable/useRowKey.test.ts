import { describe, expect, test } from '@jest/globals';
import { renderHook } from '@testing-library/react';

import { useRowKey } from '@/src/component/organism/ViewTable/useRowKey';

describe('useRowKey', () => {
    test('uses the id of the record as its key', () => {
        const { result } = renderHook(() => useRowKey());

        expect(result.current({ id: 7 })).toBe(7);
        expect(result.current({ id: 'abc' })).toBe('abc');
    });

    // A record not saved yet must keep its key while it is in the table, even across renders.
    test('gives each record without id a unique key, the same on every call', () => {
        const { result, rerender } = renderHook(() => useRowKey<{ id?: number; name: string }>());
        const first = { name: 'a' };
        const second = { name: 'b' };

        const firstKey = result.current(first);
        expect(result.current(second)).not.toBe(firstKey);

        rerender();
        expect(result.current(first)).toBe(firstKey);
        expect(first).not.toHaveProperty('key');
    });
});
