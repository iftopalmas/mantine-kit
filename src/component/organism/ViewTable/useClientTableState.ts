import { useEffect, useMemo, useState } from 'react';

import type { DataTableSortStatus } from 'mantine-datatable';

import { columnComparator, Comparator } from './ColumnComparator';
import { DEFAULT_SORT_STATUS, FIRST_PAGE, PAGE_SIZES, TableState } from './TableState';

/**
 * Sort used while the `compare` function applies, when `defaultSortStatus` is not given: it matches no column, so no
 * header shows the sort indicator, and the first click on any column sorts it in ascending order.
 */
const NO_COLUMN_SORT_STATUS = { columnAccessor: '', direction: 'asc' } as const;

/** Options of {@link useClientTableState}. */
type ClientTableOptions<M> = {
    /** All records of the table. */
    data: M[];

    /** Whether only the records of the current page are returned. */
    pagination: boolean;

    /** Locale of the text comparison. */
    locale: string;

    /** Initial sort; defaults to {@link DEFAULT_SORT_STATUS}, or to no column when `compare` is given. */
    defaultSortStatus?: DataTableSortStatus<M>;

    /** Comparison function of the initial order, replaced by the sort of the column chosen in the header. */
    compare?: Comparator<M>;
};

/**
 * Sorts and paginates in the browser all the records of a table.
 * @template M type of the records
 * @return the state of the table and the records to show
 */
export function useClientTableState<M>({
    data,
    pagination,
    locale,
    defaultSortStatus,
    compare
}: ClientTableOptions<M>): TableState<M> & { records: M[] } {
    const [page, setPage] = useState(FIRST_PAGE);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<M>>(
        defaultSortStatus ?? (compare ? NO_COLUMN_SORT_STATUS : DEFAULT_SORT_STATUS)
    );
    // The `compare` function applies until the user chooses a column in the header.
    const [compareActive, setCompareActive] = useState(compare !== undefined);

    /*
     * Sorts all records before cutting the page, so each page (including in descending order) shows its part of the
     * whole set. The copy keeps the order of the given array. It is separate from the page cut, so not everything is
     * sorted again on every change of page or page size.
     */
    const sortedData = useMemo(() => {
        const comparator = compareActive && compare ? compare : columnComparator(sortStatus, locale);

        return [...data].sort(comparator);
    }, [data, sortStatus, compareActive, compare, locale]);

    // Without pagination, shows all records (e.g. a printed report), not only the ones of the first page.
    const records = useMemo(() => {
        if (!pagination) return sortedData;

        const from = (page - 1) * pageSize;
        return sortedData.slice(from, from + pageSize);
    }, [sortedData, pagination, page, pageSize]);

    function changeSortStatus(status: DataTableSortStatus<M>): void {
        setCompareActive(false);
        setSortStatus(status);
    }

    useEffect(() => {
        setPage(FIRST_PAGE);
    }, [pageSize]);

    /* If the data shrinks, goes back to the last existing page. The functional update avoids using an outdated `page`
       when the effect above has just gone back to page 1. */
    useEffect(() => {
        const totalPages = Math.ceil(data.length / pageSize);
        setPage(currentPage => (totalPages && currentPage > totalPages ? totalPages : currentPage));
    }, [data.length, pageSize]);

    return {
        records,
        page,
        pageSize,
        sortStatus,
        totalRecords: data.length,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
        onSortStatusChange: changeSortStatus
    };
}
