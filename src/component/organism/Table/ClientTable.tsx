'use client';

import { ReactElement, useCallback, useEffect, useState } from 'react';

import TableView, { BaseTableProps } from './TableView';
import { ListDataSource } from '../../../data/ListDataSource';
import useService from '../../../hook/useService';
import { Identifiable } from '../../../model/Identifiable';

/** Initial records of the table, while they are fetched; a single constant, so it is stable across renders. */
const NO_RECORDS: readonly Identifiable[] = [];

/** Props of the {@link ClientTable}. */
type ClientTableProps<M extends Identifiable, S extends ListDataSource<M>> = BaseTableProps<M, S> & {
    /** Fetches all the records shown, instead of `service.findAll()`. */
    customFetchMethod?: () => Promise<M[]>;
};

/**
 * Table that fetches all records at once, which the browser sorts and paginates.
 * @template M type of the records, shown one per row
 * @template S source of the records (e.g. a service that accesses an API)
 */
const ClientTable = <M extends Identifiable, S extends ListDataSource<M>>(
    props: ClientTableProps<M, S>
): ReactElement => {
    const { customFetchMethod, service } = props;
    const fetchMethod = useCallback(
        () => (customFetchMethod ? customFetchMethod() : service.findAll()),
        [customFetchMethod, service]
    );
    const { data: fetchedData, loading, error } = useService(fetchMethod, NO_RECORDS as M[]);
    const [data, setData] = useState<M[]>([]);

    useEffect(() => setData(fetchedData), [fetchedData]);

    const reload = useCallback(async () => setData(await fetchMethod()), [fetchMethod]);

    return <TableView {...props} data={data} setData={setData} reload={reload} loading={loading} error={error} />;
};

export default ClientTable;
