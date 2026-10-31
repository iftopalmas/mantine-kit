import { useEffect, useState } from 'react';

/** Values returned by {@link useService}. */
export type UseService<D> = {
    /** Data of the fetch, or the initial value while it has not finished (or if it failed). */
    data: D;

    /** Error of the fetch; `null` if it has not finished yet or succeeded. */
    error: unknown | null;

    /** Whether the fetch has not finished yet. */
    loading: boolean;
};

/**
 * Fetches data when the component mounts and every time `fetchMethod` changes.
 * Without an initial value, `data` is `undefined` while loading (or after a failure), so the caller must handle it.
 * @param fetchMethod function that fetches the data. It must be stable (e.g. with `useCallback`), since a new function
 *        triggers a new fetch
 * @return the data (`undefined` until the fetch finishes), the error and whether the fetch is still running
 */
function useService<T>(fetchMethod: () => Promise<T>): UseService<T | undefined>;

/**
 * Fetches data when the component mounts and every time `fetchMethod` changes, starting with the given value (e.g. an
 * empty array for a list), so `data` always has the type of the fetched data.
 * @param fetchMethod function that fetches the data. It must be stable (e.g. with `useCallback`), since a new function
 *        triggers a new fetch
 * @param initialData value of `data` until the fetch finishes (and after a failure)
 * @return the data, the error and whether the fetch is still running
 */
function useService<T>(fetchMethod: () => Promise<T>, initialData: T): UseService<T>;

function useService<T>(fetchMethod: () => Promise<T>, initialData?: T): UseService<T | undefined> {
    const [data, setData] = useState<T | undefined>(initialData);
    const [error, setError] = useState<unknown | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /* When fetchMethod changes (e.g. another filter), the previous fetch becomes obsolete. If its response arrives
           after the one of the new fetch, it cannot overwrite the current data. */
        let obsolete = false;
        fetchMethod()
            .then(responseData => !obsolete && setData(responseData))
            .catch(e => !obsolete && setError(e))
            .finally(() => !obsolete && setLoading(false));

        return () => {
            obsolete = true;
        };
    }, [fetchMethod]);

    return { data, error, loading };
}

export default useService;
