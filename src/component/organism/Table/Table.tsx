'use client';

import { ReactElement } from 'react';

import ClientTable from './ClientTable';
import ServerTable from './ServerTable';
import { BaseTableProps } from './TableView';
import { FetchPage } from '../../../data/PageRequest';
import { ListDataSource } from '../../../data/ListDataSource';
import { Identifiable } from '../../../model/Identifiable';

export type { ActionsSettings } from './TableView';

/**
 * How a table fetches its records. Without `fetchPage`, the browser receives all records, and sorts and paginates them.
 * @template M type of the records
 */
export type TableFetchProps<M> =
    | {
          /**
           * Fetches all the records shown, instead of `service.findAll()`. To show data already available, use
           * `() => Promise.resolve(data)`.
           */
          customFetchMethod?: () => Promise<M[]>;
          fetchPage?: never;
      }
    | {
          /**
           * Fetches one page at a time, so the backend sorts and paginates. Going back to page 1 when the filter
           * changes depends on it being a new function, so keep it stable otherwise (e.g. with `useCallback`).
           */
          fetchPage: FetchPage<M>;
          customFetchMethod?: never;
      };

/** Props of the {@link Table}. */
type TableProps<M extends Identifiable, S extends ListDataSource<M>> = BaseTableProps<M, S> & TableFetchProps<M>;

/**
 * A table that shows the records of a data source, with the view, edit and delete actions. Clicking a row opens the
 * record. It paginates in the browser or, with `fetchPage`, in the backend.
 * @template M type of the records, shown one per row
 * @template S source of the records (e.g. a service that accesses an API)
 */
const Table = <M extends Identifiable, S extends ListDataSource<M>>(props: TableProps<M, S>): ReactElement =>
    props.fetchPage ? <ServerTable {...props} fetchPage={props.fetchPage} /> : <ClientTable {...props} />;

export default Table;
