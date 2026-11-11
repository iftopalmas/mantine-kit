import type { DataTableSortStatus } from 'mantine-datatable';

/*
Contract of the server-side pagination of a table. It knows nothing about a specific backend: each app converts it to
the format of its API (e.g. the 0-based page of Spring).
*/

/**
 * Page of records requested from the backend.
 * @template M type of the records
 */
export type PageRequest<M> = {
    /** Number of the page, starting at the `firstPage` option of `useServerPagination` (1 by default). */
    page: number;

    /** Maximum number of records of the page. */
    size: number;

    /** Sort to apply. `columnAccessor` holds the `sortKey` of the column, if it has one, or else its `accessor`. */
    sort: DataTableSortStatus<M>;
};

/**
 * Page of records returned by the backend.
 * @template M type of the records
 */
export type PageResult<M> = {
    /** Records of the page, already sorted by the backend. */
    records: M[];

    /** Total of records of all pages. */
    totalRecords: number;
};

/**
 * Fetches a page of records. It must be stable (e.g. with `useCallback`), since a new function means that the filter
 * changed, so the table fetches again from page 1.
 * @template M type of the records
 */
export type FetchPage<M> = (request: PageRequest<M>) => Promise<PageResult<M>>;
