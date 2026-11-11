import { useCallback, useEffect, useMemo, useState } from 'react';

import { TableData } from './TableData';
import { useClientTableState } from '../ViewTable/useClientTableState';
import { ListDataSource } from '../../../data/ListDataSource';
import useService from '../../../hook/useService';
import { Identifiable } from '../../../model/Identifiable';
import { useKitConfig } from '../../../provider/useKit';

/** Initial records of the table, while they are fetched; a single constant, so it is stable across renders. */
const NO_RECORDS: never[] = [];

/** Options of {@link useClientPagination}. */
export type ClientPaginationOptions = {
    /** Whether the table is paginated; defaults to true. Without it, every record is shown. */
    pagination?: boolean;
};

/** Fetches all records of a table. */
export type FetchAll<M> = () => Promise<M[]>;

/**
 * Fetches all records of a {@link Table} at once (e.g. from an API), which the browser then sorts (following the locale)
 * and paginates.
 * @template M type of the records
 * @param source an object whose `findAll` fetches all records (e.g. a service), or a function that fetches them (e.g.
 *        with a filter). It must be stable (e.g. a module constant, or a function created with `useCallback`), since a
 *        new object or function fetches again: a `new Service()` inside the component would fetch on every render
 * @param options whether the table is paginated
 * @return the data to give to the `data` prop of the {@link Table}
 */
export function useClientPagination<M extends Identifiable>(
    source: Pick<ListDataSource<M>, 'findAll'> | FetchAll<M>,
    { pagination = true }: ClientPaginationOptions = {}
): TableData<M> {
    // Calls the method on the object, so it keeps its `this`.
    const fetchAll = useMemo(() => (typeof source === 'function' ? source : () => source.findAll()), [source]);
    const { locale } = useKitConfig();
    const { data: fetchedData, loading, error } = useService<M[]>(fetchAll, NO_RECORDS);
    const [data, setData] = useState<M[]>(NO_RECORDS);

    useEffect(() => setData(fetchedData), [fetchedData]);

    const reload = useCallback(async () => setData(await fetchAll()), [fetchAll]);
    const { records, ...tableState } = useClientTableState({ data, pagination, locale });

    return { records, setRecords: setData, reload, loading, error, tableState, paginated: pagination };
}
