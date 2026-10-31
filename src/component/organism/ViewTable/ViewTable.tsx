'use client';

import { useEffect, useMemo, useState } from 'react';

import {
    DataTable,
    DataTableColumn,
    DataTablePaginationProps,
    DataTableProps,
    DataTableSortStatus
} from 'mantine-datatable';

import { Identifiable } from '../../../model/Identifiable';
import { useKitConfig } from '../../../provider/useKit';
import { columnComparator, Comparator } from './ColumnComparator';
import { useRowKey } from './useRowKey';

/** Options of records per page. The largest one lets long tables (and end-to-end tests) show every row in one page. */
const PAGE_SIZES = [10, 20, 50, 200];

/** Default sort when neither `defaultSortStatus` nor `compare` is given. */
const DEFAULT_SORT_STATUS = { columnAccessor: 'id', direction: 'asc' } as const;

/**
 * Sort used while the `compare` function applies, when `defaultSortStatus` is not given: it matches no column, so no
 * header shows the sort indicator, and the first click on any column sorts it in ascending order.
 */
const NO_COLUMN_SORT_STATUS = { columnAccessor: '', direction: 'asc' } as const;

/** Function that defines extra attributes (e.g. aria-label) for each pagination control button. */
type PaginationControlPropsGetter = Extract<DataTablePaginationProps, { page: number }>['getPaginationControlProps'];

/**
 * Props of the {@link DataTable} passed straight through by the ViewTable.
 * Only the props actually used by the callers are accepted: using `Partial<DataTableProps<M>>` makes TypeScript combine
 * the variants of the `DataTableProps` union with the ones of `paginationProps`, which exhausts the memory of `tsc`.
 */
type DataTablePassThroughProps<M extends Identifiable> = Pick<
    DataTableProps<M>,
    | 'onRowClick'
    | 'rowStyle'
    | 'noRecordsText'
    | 'highlightOnHover'
    | 'highlightOnHoverColor'
    | 'className'
    | 'minHeight'
    | 'withColumnBorders'
    | 'verticalSpacing'
    | 'horizontalSpacing'
>;

/**
 * TableProps is a generic type for the ViewTable component props.
 */
type TableProps<M extends Identifiable> = {
    data: M[];
    columns: DataTableColumn<M>[];
    loading?: boolean;
    pagination?: boolean;
    /** Shows the ID column, automatically added to the given columns. */
    showIdColumn?: boolean;
    /**
     * Initial sort of the table. Default: by `id`, ascending.
     * Give another value when the natural order of the data should not be by `id` (e.g. when the backend already
     * returns the data in an order to keep). Along with `compare`, it only tells which header shows the sort indicator
     * in the initial order.
     */
    defaultSortStatus?: DataTableSortStatus<M>;
    /**
     * Comparison function that defines the initial order, instead of the column of `defaultSortStatus`. It allows
     * sorting by more than one criterion (e.g. city and, in the same city, year descending). After the user clicks the
     * header of a column, the sort of the column applies.
     */
    compare?: Comparator<M>;
    /** Extra attributes for the pagination control buttons. It only has effect when `pagination` is true. */
    getPaginationControlProps?: PaginationControlPropsGetter;
} & DataTablePassThroughProps<M>;

/**
 * The ViewTable component is a wrapper for the Mantine DataTable component.
 * @template M - Model that extends from {@link Identifiable}
 * @param data the data to be displayed in this ViewTable
 * @param {DataTableColumn<M>[]} columns - The columns to be displayed in this ViewTable
 * @param loading Indicates if the data to be displayed is being loaded yet or not
 * @param pagination Indicates whether to show pagination or not.
 * @param getPaginationControlProps extra attributes for the pagination control buttons
 * @param compare comparison function of the initial order, replaced by the sort of the column chosen in the header
 * @param rest remaining props, passed to the DataTable
 * @return the table with the data, sortable and (optionally) paginated
 */
const ViewTable = <M extends Identifiable>({
    data,
    columns,
    loading,
    pagination = true,
    showIdColumn = true,
    defaultSortStatus,
    compare,
    getPaginationControlProps,
    ...rest
}: TableProps<M>) => {
    const { locale, messages } = useKitConfig();
    const [page, setPage] = useState(1);
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
    const rowKey = useRowKey<M>();

    function changeSortStatus(status: DataTableSortStatus<M>): void {
        setCompareActive(false);
        setSortStatus(status);
    }

    const effectiveColumns: DataTableColumn<M>[] = [
        {
            title: 'ID',
            accessor: 'id',
            hidden: !showIdColumn,
            sortable: true,
            render: item => <span>{item.id}</span>
        },
        ...columns
    ];

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    /* If the data shrinks, goes back to the last existing page. The functional update avoids using an outdated `page`
       when the effect above has just gone back to page 1. */
    useEffect(() => {
        const totalPages = Math.ceil(data.length / pageSize);
        setPage(currentPage => (totalPages && currentPage > totalPages ? totalPages : currentPage));
    }, [data.length, pageSize]);

    /* Typed only with the pagination props (and not as Partial<DataTableProps>) to not exhaust the memory of tsc.
       See the comment of DataTablePassThroughProps. */
    const paginationProps: DataTablePaginationProps = pagination
        ? {
              page,
              onPageChange: p => setPage(p),
              totalRecords: data.length,
              recordsPerPage: pageSize,
              recordsPerPageOptions: PAGE_SIZES,
              onRecordsPerPageChange: setPageSize,
              recordsPerPageLabel: messages.table.recordsPerPage,
              paginationText: messages.table.pagination,
              getPaginationControlProps
          }
        : {};

    // This DataTable is the one of https://www.npmjs.com/package/mantine-datatable (there are other libraries with this name).
    return (
        <DataTable
            minHeight={200}
            verticalSpacing="sm"
            striped
            columns={effectiveColumns}
            records={records}
            idAccessor={rowKey}
            noRecordsText={messages.table.noRecords}
            fetching={loading}
            sortStatus={sortStatus}
            onSortStatusChange={changeSortStatus}
            customRowAttributes={record => ({ 'data-testid': `row-${record.id}` })}
            {...paginationProps}
            {...rest}
        />
    );
};

export default ViewTable;
