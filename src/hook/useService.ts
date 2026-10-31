import { useEffect, useState } from 'react';

/**
 * Fetches data when the component mounts and every time `fetchMethod` changes.
 * @param fetchMethod function that fetches the data. It must be stable (e.g. with `useCallback`), since a new function
 *        triggers a new fetch
 * @return the data (an empty array until the fetch finishes), the error and whether the fetch is still running
 */
const useService = <T>(fetchMethod: () => Promise<T>) => {
    const [data, setData] = useState<T>([] as T);
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
};

export default useService;
