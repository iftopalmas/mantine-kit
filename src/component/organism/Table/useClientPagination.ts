import { useCallback, useEffect, useState } from 'react';

import { TableData } from './TableData';
import { useClientTableState } from '../ViewTable/useClientTableState';
import useService from '../../../hook/useService';
import { useKitConfig } from '../../../provider/useKit';

/** Initial records of the table, while they are fetched; a single constant, so it is stable across renders. */
const NO_RECORDS: never[] = [];

/** Options of {@link useClientPagination}. */
export type ClientPaginationOptions = {
    /** Whether the table is paginated; defaults to true. Without it, every record is shown. */
    pagination?: boolean;
};

/**
 * Fetches all records of a {@link Table} at once (e.g. from an API), which the browser then sorts (following the locale)
 * and paginates.
 * @template M type of the records
 * @param fetchAll fetches all records (e.g. `service.findAll()`). It must be stable (e.g. with `useCallback`), since a
 *        new function fetches again
 * @param options whether the table is paginated
 * @return the data to give to the `data` prop of the {@link Table}
 */
export function useClientPagination<M>(
    fetchAll: () => Promise<M[]>,
    { pagination = true }: ClientPaginationOptions = {}
): TableData<M> {
    const { locale } = useKitConfig();
    const { data: fetchedData, loading, error } = useService<M[]>(fetchAll, NO_RECORDS);
    const [data, setData] = useState<M[]>(NO_RECORDS);

    useEffect(() => setData(fetchedData), [fetchedData]);

    const reload = useCallback(async () => setData(await fetchAll()), [fetchAll]);
    const { records, ...tableState } = useClientTableState({ data, pagination, locale });

    return { records, setRecords: setData, reload, loading, error, tableState, paginated: pagination };
}
