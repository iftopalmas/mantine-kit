'use client';

import { DataTable, DataTableColumn, DataTablePaginationProps, DataTableProps } from 'mantine-datatable';

import { Identifiable } from '../../../model/Identifiable';
import { useKitConfig } from '../../../provider/useKit';
import { PAGE_SIZES, TableState } from './TableState';
import { useRowKey } from './useRowKey';

/** Function that defines extra attributes (e.g. aria-label) for each pagination control button. */
type PaginationControlPropsGetter = Extract<DataTablePaginationProps, { page: number }>['getPaginationControlProps'];

/**
 * Props of the {@link DataTable} passed straight through.
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

/** Props of the {@link DataTableView} that do not depend on where the table is sorted and paginated. */
export type DataTableViewBaseProps<M extends Identifiable> = {
    columns: DataTableColumn<M>[];

    /** Whether the records are being loaded. */
    loading?: boolean;

    /** Shows the ID column, automatically added to the given columns. */
    showIdColumn?: boolean;

    /** Extra attributes for the pagination control buttons, when the table is paginated. */
    getPaginationControlProps?: PaginationControlPropsGetter;
} & DataTablePassThroughProps<M>;

/** Props of the {@link DataTableView}. */
type DataTableViewProps<M extends Identifiable> = DataTableViewBaseProps<M> & {
    /** Records shown, already sorted and cut to the current page. */
    records: M[];

    /** Pagination and sort of the table. */
    state: TableState<M>;

    /** Whether the pagination controls are shown. */
    paginated: boolean;
};

/**
 * Shows records as received, with the given pagination and sort (e.g. kept by a backend that paginates). It is the
 * visual part of the tables, on top of the mantine-datatable `DataTable`, with the texts of the locale.
 * @template M type of the records, shown one per row
 */
const DataTableView = <M extends Identifiable>({
    records,
    state,
    paginated,
    columns,
    loading,
    showIdColumn = true,
    getPaginationControlProps,
    ...rest
}: DataTableViewProps<M>) => {
    const { messages } = useKitConfig();
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

export default DataTableView;
