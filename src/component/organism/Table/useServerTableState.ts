import { useCallback, useEffect, useState } from 'react';

import { SetRecords } from './TableView';
import { DEFAULT_SORT_STATUS, FIRST_PAGE, PAGE_SIZES, TableState } from '../ViewTable/TableState';
import { FetchPage, PageRequest, PageResult } from '../../../data/PageRequest';
import useService from '../../../hook/useService';

/** Result before the first response; a single constant, so it is stable across renders. */
const NO_PAGE: PageResult<never> = { records: [], totalRecords: 0 };

/** Values returned by {@link useServerTableState}. */
type ServerTableState<M> = {
    /** Records of the current page. */
    records: M[];

    /** Changes the records shown, without fetching them. */
    setRecords: SetRecords<M>;

    /** Fetches the current page again. The promise does not wait for the response. */
    reload: () => Promise<void>;

    /** Whether a page is being fetched. */
    loading: boolean;

    /** Error of the last fetch; `null` if there is none. */
    error: unknown;

    /** Pagination and sort, to give to the table. */
    tableState: TableState<M>;
};

/**
 * Builds what is sent to the backend. The table state keeps the `columnAccessor`, as the header needs it to show the
 * sort indicator, but the backend must receive the `sortKey`, when the column has one.
 * @param request page, size and sort chosen in the table
 */
function toBackendRequest<M>(request: PageRequest<M>): PageRequest<M> {
    const { sort } = request;

    return { ...request, sort: { ...sort, columnAccessor: sort.sortKey ?? sort.columnAccessor } };
}

/**
 * Holds the page, size and sort of a table paginated by the backend, and fetches the page they define.
 * @template M type of the records
 * @param fetchPage fetches a page. A new function means that the filter changed, so it goes back to page 1
 * @return the records of the current page, the state of the table and the function that fetches the page again
 */
export function useServerTableState<M>(fetchPage: FetchPage<M>): ServerTableState<M> {
    // A single object, so a copy of it fetches the same page again, and a change is always a single fetch.
    const [request, setRequest] = useState<PageRequest<M>>({
        page: FIRST_PAGE,
        size: PAGE_SIZES[0],
        sort: DEFAULT_SORT_STATUS
    });
    const [previousFetchPage, setPreviousFetchPage] = useState(() => fetchPage);

    /* Done while rendering, as an effect would first fetch the new filter with the old page.
       See https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes */
    if (fetchPage !== previousFetchPage) {
        setPreviousFetchPage(() => fetchPage);
        setRequest(current => ({ ...current, page: FIRST_PAGE }));
    }

    const fetchCurrentPage = useCallback(() => fetchPage(toBackendRequest(request)), [fetchPage, request]);
    const { data, loading, error } = useService<PageResult<M>>(fetchCurrentPage, NO_PAGE);
    const [records, setRecords] = useState<M[]>([]);

    useEffect(() => setRecords(data.records), [data]);

    const lastPage = Math.max(Math.ceil(data.totalRecords / request.size), FIRST_PAGE);

    // The current page may not exist anymore (e.g. its last record was deleted).
    useEffect(() => {
        if (!loading && request.page > lastPage) setRequest(current => ({ ...current, page: lastPage }));
    }, [loading, request.page, lastPage]);

    const reload = useCallback(async () => setRequest(current => ({ ...current })), []);

    return {
        records,
        setRecords,
        reload,
        loading,
        error,
        tableState: {
            page: request.page,
            pageSize: request.size,
            sortStatus: request.sort,
            totalRecords: data.totalRecords,
            onPageChange: page => setRequest(current => ({ ...current, page })),
            onPageSizeChange: size => setRequest(current => ({ ...current, size, page: FIRST_PAGE })),
            onSortStatusChange: sort => setRequest(current => ({ ...current, sort, page: FIRST_PAGE }))
        }
    };
}
