import { describe, expect, test } from '@jest/globals';
import { act, renderHook, waitFor } from '@testing-library/react';

import { ServiceKey, useKeyedService } from '@/src/hook/useKeyedService';

/** Pending fetch of a key, resolved or rejected by the test whenever it wants. */
type Pending = { resolve: (value: string) => void; reject: (error: Error) => void };

/**
 * Creates a fetch function whose responses the test controls: each call stays pending until the test resolves it.
 * @return the fetch function and the pending fetches, indexed by key
 */
function controlledFetch(): { fetch: (key: ServiceKey) => Promise<string>; pending: Map<ServiceKey, Pending> } {
    const pending = new Map<ServiceKey, Pending>();
    const fetch = (key: ServiceKey) => new Promise<string>((resolve, reject) => pending.set(key, { resolve, reject }));
    return { fetch, pending };
}

describe('useKeyedService', () => {
    test('stays loading until the fetch of the key finishes and then exposes the data', async () => {
        const { fetch, pending } = controlledFetch();
        const { result } = renderHook(() => useKeyedService(2008, fetch));

        expect(result.current).toEqual({ data: undefined, error: undefined, loading: true });

        await act(async () => pending.get(2008)?.resolve('data of 2008'));

        expect(result.current).toEqual({ data: 'data of 2008', error: undefined, loading: false });
    });

    // E.g. changing the year of a filter: the data of the previous year cannot appear under the new filter.
    test('when the key changes, stops exposing the previous data until the new fetch finishes', async () => {
        const { fetch, pending } = controlledFetch();
        const { result, rerender } = renderHook(({ key }) => useKeyedService(key, fetch), {
            initialProps: { key: 2008 as ServiceKey }
        });
        await act(async () => pending.get(2008)?.resolve('data of 2008'));

        rerender({ key: 2025 });

        expect(result.current).toEqual({ data: undefined, error: undefined, loading: true });
        await act(async () => pending.get(2025)?.resolve('data of 2025'));
        expect(result.current.data).toBe('data of 2025');
    });

    test('discards the response of a key that was already replaced', async () => {
        const { fetch, pending } = controlledFetch();
        const { result, rerender } = renderHook(({ key }) => useKeyedService(key, fetch), {
            initialProps: { key: 'a' as ServiceKey }
        });

        rerender({ key: 'b' });
        await act(async () => pending.get('b')?.resolve('b'));
        await act(async () => pending.get('a')?.resolve('a'));

        expect(result.current.data).toBe('b');
    });

    // An error cannot be shown as "no data", nor keep appearing after the key changes.
    test('exposes the error only for the key that failed', async () => {
        const { fetch, pending } = controlledFetch();
        const error = new Error('HTTP 500');
        const { result, rerender } = renderHook(({ key }) => useKeyedService(key, fetch), {
            initialProps: { key: 1 as ServiceKey }
        });

        await act(async () => pending.get(1)?.reject(error));
        expect(result.current).toEqual({ data: undefined, error, loading: false });

        rerender({ key: 2 });
        await waitFor(() => expect(pending.has(2)).toBe(true));
        expect(result.current.error).toBeUndefined();
    });
});
