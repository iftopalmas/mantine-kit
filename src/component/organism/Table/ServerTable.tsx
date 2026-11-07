'use client';

import { ReactElement } from 'react';

import TableView, { BaseTableProps } from './TableView';
import { useServerTableState } from './useServerTableState';
import { ListDataSource } from '../../../data/ListDataSource';
import { FetchPage } from '../../../data/PageRequest';
import { Identifiable } from '../../../model/Identifiable';

/** Props of the {@link ServerTable}. */
type ServerTableProps<M extends Identifiable, S extends ListDataSource<M>> = BaseTableProps<M, S> & {
    /** Fetches one page of records. */
    fetchPage: FetchPage<M>;
};

/**
 * Table that fetches one page at a time, already sorted and paginated by the backend.
 * @template M type of the records, shown one per row
 * @template S source of the records (e.g. a service that accesses an API)
 */
const ServerTable = <M extends Identifiable, S extends ListDataSource<M>>(
    props: ServerTableProps<M, S>
): ReactElement => {
    const { records, setRecords, reload, loading, error, tableState } = useServerTableState(props.fetchPage);

    return (
        <TableView
            {...props}
            data={records}
            setData={setRecords}
            reload={reload}
            loading={loading}
            error={error}
            tableState={tableState}
        />
    );
};

export default ServerTable;
