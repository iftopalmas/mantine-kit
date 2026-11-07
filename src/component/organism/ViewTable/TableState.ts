import type { DataTableSortStatus } from 'mantine-datatable';

/*
Pagination and sort state of a table, and its initial values, shared by the state kept in the browser and the one kept
for a backend that paginates.
*/

/** Options of records per page. The largest one lets long tables (and end-to-end tests) show every row in one page. */
export const PAGE_SIZES = [10, 20, 50, 200];

/** Number of the first page of a table. */
export const FIRST_PAGE = 1;

/** Default sort when neither `defaultSortStatus` nor `compare` is given. */
export const DEFAULT_SORT_STATUS = { columnAccessor: 'id', direction: 'asc' } as const;

/**
 * Pagination and sort of a table, with the callbacks that change them.
 * @template M type of the records
 */
export type TableState<M> = {
    /** Current page, starting at 1. */
    page: number;

    /** Records per page. */
    pageSize: number;

    /** Current sort. */
    sortStatus: DataTableSortStatus<M>;

    /** Total of records of all pages. */
    totalRecords: number;

    /** Called when the user chooses a page. */
    onPageChange: (page: number) => void;

    /** Called when the user chooses the records per page. */
    onPageSizeChange: (pageSize: number) => void;

    /** Called when the user chooses the sort. */
    onSortStatusChange: (sortStatus: DataTableSortStatus<M>) => void;
};
