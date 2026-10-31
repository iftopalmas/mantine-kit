import { useEffect, useState } from 'react';

/** Key of a fetch (e.g. the year being queried), which tells which selection a result belongs to. */
export type ServiceKey = string | number;

/** Values returned by {@link useKeyedService}. */
export type UseKeyedService<T> = {
    /** Data of the fetch of the current key; `undefined` while it has not finished or if it failed. */
    data?: T;

    /** Error of the fetch of the current key; `undefined` if it has not finished yet or succeeded. */
    error?: unknown;

    /** Whether the fetch of the current key has not finished yet. */
    loading: boolean;
};

/** Result of a fetch, kept with the key that was queried. */
type KeyedResult<T> = { key: ServiceKey; data?: T; error?: unknown };

/**
 * Fetches data that depends on a key (e.g. a filter of the screen) and exposes only the result of the current key.
 * When the key changes, the data and the error of the previous fetch are no longer exposed and `loading` becomes
 * `true` until the new fetch finishes, so the screen never shows data of another selection. A response that arrives
 * after the key changed is discarded.
 * @param key key of the fetch; a new key triggers a new fetch
 * @param fetchMethod function that fetches the data of a key. It must be stable (e.g. defined outside the component),
 *        since a new function also triggers a new fetch
 * @return the data, the error and the loading state of the current key
 */
export function useKeyedService<T>(key: ServiceKey, fetchMethod: (key: ServiceKey) => Promise<T>): UseKeyedService<T> {
    const [result, setResult] = useState<KeyedResult<T>>();

    useEffect(() => {
        // If the key changes before the fetch finishes, its response cannot replace the one of the new key.
        let obsolete = false;
        fetchMethod(key)
            .then(data => !obsolete && setResult({ key, data }))
            .catch(error => !obsolete && setResult({ key, error }));

        return () => {
            obsolete = true;
        };
    }, [key, fetchMethod]);

    // A result of another key stays in the state until the new fetch finishes: it is not exposed.
    const current = result?.key === key ? result : undefined;
    return { data: current?.data, error: current?.error, loading: !current };
}
