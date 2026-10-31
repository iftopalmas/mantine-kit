import { describe, expect, test } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react';

import useService from '@/src/hook/useService';

/** Promise the test resolves whenever it wants, to simulate responses that arrive out of order. */
type Pending = { promise: Promise<string>; resolve: (value: string) => void };

/**
 * Creates a pending promise, resolved by the test.
 * @return the promise and the function that resolves it
 */
function pending(): Pending {
    let resolve: (value: string) => void = () => undefined;
    const promise = new Promise<string>(r => (resolve = r));
    return { promise, resolve };
}

describe('useService', () => {
    test('returns the data of the fetch and stops loading', async () => {
        const fetch = () => Promise.resolve('data');
        const { result } = renderHook(() => useService(fetch));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data).toBe('data');
    });

    // E.g. changing a filter: if the fetch of the previous filter answers last, the list would show its data.
    test('ignores the response of a fetch that was replaced by another one', async () => {
        const old = pending();
        const latest = pending();
        const { result, rerender } = renderHook(({ fetch }) => useService(fetch), {
            initialProps: { fetch: () => old.promise }
        });

        rerender({ fetch: () => latest.promise });
        await act(async () => latest.resolve('latest'));
        await act(async () => old.resolve('old'));

        expect(result.current.data).toBe('latest');
    });
});
