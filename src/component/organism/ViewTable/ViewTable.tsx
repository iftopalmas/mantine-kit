'use client';

import {
    DataTable,
    DataTableColumn,
    DataTablePaginationProps,
    DataTableProps,
    DataTableSortStatus
} from 'mantine-datatable';

import { Identifiable } from '../../../model/Identifiable';
import { useKitConfig } from '../../../provider/useKit';
import { Comparator } from './ColumnComparator';
import { PAGE_SIZES, TableState } from './TableState';
import { useClientTableState } from './useClientTableState';
import { useRowKey } from './useRowKey';

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
    /**
     * Pagination and sort kept outside the table (e.g. by a backend that paginates). When given, `data` is shown as
     * received, always with the pagination controls, and `pagination`, `defaultSortStatus` and `compare` do not apply.
     */
    externalState?: TableState<M>;
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
 * @param externalState pagination and sort kept outside the table, which then shows `data` as received
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
    externalState,
    getPaginationControlProps,
    ...rest
}: TableProps<M>) => {
    const { locale, messages } = useKitConfig();
    // Hooks cannot be conditional: with an external state, the result of this one is just ignored.
    const clientState = useClientTableState({ data, pagination, locale, defaultSortStatus, compare });
    const state = externalState ?? clientState;
    const records = externalState ? data : clientState.records;
    const paginated = externalState !== undefined || pagination;
    const rowKey = useRowKey<M>();

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

    /* Typed only with the pagination props (and not as Partial<DataTableProps>) to not exhaust the memory of tsc.
       See the comment of DataTablePassThroughProps. */
    const paginationProps: DataTablePaginationProps = paginated
        ? {
              page: state.page,
              onPageChange: state.onPageChange,
              totalRecords: state.totalRecords,
              recordsPerPage: state.pageSize,
              recordsPerPageOptions: PAGE_SIZES,
              onRecordsPerPageChange: state.onPageSizeChange,
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
            sortStatus={state.sortStatus}
            onSortStatusChange={state.onSortStatusChange}
            customRowAttributes={record => ({ 'data-testid': `row-${record.id}` })}
            {...paginationProps}
            {...rest}
        />
    );
};

export default ViewTable;
