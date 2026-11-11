'use client';

import { DataTableSortStatus } from 'mantine-datatable';

import { Identifiable } from '../../../model/Identifiable';
import { useKitConfig } from '../../../provider/useKit';
import { Comparator } from './ColumnComparator';
import DataTableView, { DataTableViewBaseProps } from './DataTableView';
import { useClientTableState } from './useClientTableState';

/** Props of the {@link ViewTable}. */
type ViewTableProps<M extends Identifiable> = DataTableViewBaseProps<M> & {
    /** All records of the table. */
    data: M[];

    /** Whether the table is paginated; defaults to true. Without it, every record is shown (e.g. a printed report). */
    pagination?: boolean;

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
};

/**
 * Table that sorts (following the locale) and paginates in the browser all the given records, on top of the
 * mantine-datatable `DataTable`.
 * @template M type of the records, shown one per row
 */
const ViewTable = <M extends Identifiable>({
    data,
    pagination = true,
    defaultSortStatus,
    compare,
    ...rest
}: ViewTableProps<M>) => {
    const { locale } = useKitConfig();
    const { records, ...state } = useClientTableState({ data, pagination, locale, defaultSortStatus, compare });

    return <DataTableView {...rest} records={records} state={state} paginated={pagination} />;
};

export default ViewTable;
