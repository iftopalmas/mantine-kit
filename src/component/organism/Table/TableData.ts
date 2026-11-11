import { TableState } from '../ViewTable/TableState';

/** Function that sets the records of a table, as the one of `useState`. */
export type SetRecords<M> = (value: ((prevState: M[]) => M[]) | M[]) => void;

/**
 * Records of a {@link Table} and their pagination and sort, given by `useClientPagination` (sorted and paginated in the
 * browser) or `useServerPagination` (sorted and paginated by the backend).
 * @template M type of the records
 */
export type TableData<M> = {
    /** Records shown, already sorted and cut to the current page. */
    records: M[];

    /** Changes the records of the table without fetching them (e.g. to remove one that was not saved yet). */
    setRecords: SetRecords<M>;

    /** Fetches the records again (e.g. after a deletion). */
    reload: () => Promise<void>;

    /** Whether the records are being fetched. */
    loading: boolean;

    /** Error of the last fetch; `null` if there is none. */
    error: unknown;

    /** Pagination and sort of the table. */
    tableState: TableState<M>;

    /** Whether the pagination controls are shown. */
    paginated: boolean;
};
