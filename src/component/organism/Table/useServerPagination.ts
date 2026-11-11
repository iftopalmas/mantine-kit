import { useCallback, useEffect, useState } from 'react';

import { TableData } from './TableData';
import { DEFAULT_SORT_STATUS, FIRST_PAGE, PAGE_SIZES } from '../ViewTable/TableState';
import { FetchPage, PageRequest, PageResult } from '../../../data/PageRequest';
import useService from '../../../hook/useService';

/** Result before the first response; a single constant, so it is stable across renders. */
const NO_PAGE: PageResult<never> = { records: [], totalRecords: 0 };

/** Options of {@link useServerPagination}. */
export type ServerPaginationOptions = {
    /**
     * Number of the first page in the requests to the backend (e.g. 0 for Spring Data); defaults to 1. It only changes
     * the `page` sent to `fetchPage`: the table always shows the pages starting at 1.
     */
    firstPage?: number;
};

/**
 * Builds what is sent to the backend. The table state keeps the `columnAccessor`, as the header needs it to show the
 * sort indicator, but the backend must receive the `sortKey`, when the column has one.
 * @param request page (starting at {@link FIRST_PAGE}), size and sort chosen in the table
 * @param firstPage number of the first page for the backend
 */
function toBackendRequest<M>(request: PageRequest<M>, firstPage: number): PageRequest<M> {
    const { page, sort } = request;

    return {
        ...request,
        page: page - FIRST_PAGE + firstPage,
        sort: { ...sort, columnAccessor: sort.sortKey ?? sort.columnAccessor }
    };
}

/**
 * Fetches one page at a time of a {@link Table}, already sorted and paginated by the backend. It goes back to page 1
 * when the page size, the sort or the filter changes, and to the last existing page when the current one no longer
 * exists (e.g. its last record was deleted).
 * @template M type of the records
 * @param fetchPage fetches a page. A new function means that the filter changed, so it goes back to page 1; keep it
 *        stable otherwise (e.g. with `useCallback`)
 * @param options number of the first page for the backend
 * @return the data to give to the `data` prop of the {@link Table}
 */
export function useServerPagination<M>(
    fetchPage: FetchPage<M>,
    { firstPage = FIRST_PAGE }: ServerPaginationOptions = {}
): TableData<M> {
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

    const fetchCurrentPage = useCallback(
        () => fetchPage(toBackendRequest(request, firstPage)),
        [fetchPage, request, firstPage]
    );
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
        },
        paginated: true
    };
}
