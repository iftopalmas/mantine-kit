'use client';

import { ReactElement, useMemo } from 'react';

import { Box } from '@mantine/core';
import { DataTableColumn } from 'mantine-datatable';

import { TableState } from '../ViewTable/TableState';
import ViewTable from '../ViewTable/ViewTable';
import RowActions from './RowActions';
import { ListDataSource } from '../../../data/ListDataSource';
import { KitMessages } from '../../../i18n/KitMessages';
import { Identifiable } from '../../../model/Identifiable';
import { useKitConfig } from '../../../provider/useKit';
import { FormRouteSegments } from '../../../router/FormRouteSegments';
import ErrorAlert from '../../atom/ErrorAlert/ErrorAlert';
import { showErrorNotification, showSuccessNotification } from '../../../util/Notifications';

/*
Color of the row under the mouse. The default color of mantine-datatable (gray-1) is barely distinguishable from the
zebra stripes (gray-0), so the highlight went unnoticed. The light variant of the primary color adapts to the light and
dark color schemes.
*/
const ROW_HOVER_COLOR = 'var(--mantine-primary-color-light)';

/** Function that sets the records of the table, obtained from `useState`. */
export type SetRecords<M> = (value: ((prevState: M[]) => M[]) | M[]) => void;

/** Which actions the table shows for each record. */
export type ActionsSettings = {
    /** Whether the actions column is shown. */
    canShowActions: boolean;

    /** Whether the view action is shown. */
    canView: boolean;

    /** Whether the edit action is shown. */
    canEdit: boolean;

    /** Whether the delete action is shown. */
    canDelete: boolean;
};

/** Every action shown, used for the settings the caller does not give. */
const DEFAULT_ACTIONS_SETTINGS: ActionsSettings = {
    canShowActions: true,
    canView: true,
    canEdit: true,
    canDelete: true
};

/** Props of the {@link Table} that do not depend on how the records are fetched. */
export type BaseTableProps<M extends Identifiable, S extends ListDataSource<M>> = {
    /** Source of the records and of their deletion (e.g. a service that accesses an API). */
    service: S;

    /** Columns of the table. */
    columns: DataTableColumn<M>[];

    /** Base path of the pages of the records (e.g. `/region`), used to build the view and edit URLs. */
    basePath: string;

    /** Which actions are shown; the ones not given are shown. */
    actionsSettings?: Partial<ActionsSettings>;

    /** Whether the table is paginated. It does not apply to `fetchPage`, which always paginates. */
    pagination?: boolean;

    /**
     * Called by the edit action instead of opening the edit page of the record.
     * @param itemId id of the record to edit
     */
    customEditFunction?: (itemId: M['id']) => void;

    /**
     * Builds the URL opened to view a record (click on the row or on the view icon).
     * If absent, the default route is used: `${basePath}/<view segment>/${item.id}`.
     */
    getViewUrl?: (item: M) => string;
};

/** Props of the {@link TableView}. */
type TableViewProps<M extends Identifiable, S extends ListDataSource<M>> = BaseTableProps<M, S> & {
    /** Records shown. */
    data: M[];

    /** Changes the records shown, to remove one that was not saved yet. */
    setData: SetRecords<M>;

    /** Fetches the records again after a deletion. */
    reload: () => Promise<void>;

    /** Whether the records are being fetched. */
    loading: boolean;

    /** Error of the fetch, if any. */
    error: unknown;

    /** Pagination and sort kept outside the table; absent when the browser does them. */
    tableState?: TableState<M>;
};

/**
 * Returns the view URL of a record: the one of `getViewUrl`, if given; otherwise, the default view route.
 * @param props props of the table
 * @param item record
 * @param segments URL segments of the form pages
 */
function viewUrl<M extends Identifiable, S extends ListDataSource<M>>(
    props: BaseTableProps<M, S>,
    item: M,
    segments: FormRouteSegments
): string {
    return props.getViewUrl ? props.getViewUrl(item) : `${props.basePath}/${segments.view}/${item.id}`;
}

/**
 * Creates the function that deletes a record and reloads the table.
 * @param setData function that sets the records of the table
 * @param service source of the records, which deletes them
 * @param reload fetches the records again after the deletion
 * @param messages texts of the locale
 * @return a function that receives the record to delete and returns a promise resolved when it is deleted
 */
function getDeleteRecordFn<M extends Identifiable, S extends ListDataSource<M>>(
    setData: SetRecords<M>,
    service: S,
    reload: () => Promise<void>,
    messages: KitMessages
): (item: M) => Promise<void> {
    return async (item: M) => {
        const id = item?.id ?? 0;

        // Without an id, the record was added only to the array and was not sent to the backend: just remove it.
        if (!id) {
            setData(prevData => prevData.filter(current => current !== item));
            return;
        }

        try {
            await service.delete(id);
            showSuccessNotification(messages.table.deleteSuccess, messages.common.success);
            await reload();
        } catch (e) {
            showErrorNotification(e, undefined, messages.common.error);
        }
    };
}

/**
 * Visual part of the {@link Table}, the same for any way of fetching the records: the records with the view, edit and
 * delete actions, or an alert when they cannot be fetched.
 * @template M type of the records, shown one per row
 * @template S source of the records (e.g. a service that accesses an API)
 */
const TableView = <M extends Identifiable, S extends ListDataSource<M>>(props: TableViewProps<M, S>): ReactElement => {
    const { service, columns, basePath, customEditFunction, data, setData, reload, loading, error, tableState } = props;
    const { router, messages, formRouteSegments } = useKitConfig();
    const navigate = router.useNavigate();
    const settings: ActionsSettings = { ...DEFAULT_ACTIONS_SETTINGS, ...props.actionsSettings };

    const deleteRecord = useMemo(
        () => getDeleteRecordFn(setData, service, reload, messages),
        [setData, service, reload, messages]
    );

    const actionsColumn: DataTableColumn<M> = {
        accessor: 'actions',
        title: <Box mr={6}>{messages.table.actions}</Box>,
        textAlign: 'right',
        render: item => (
            <RowActions
                {...settings}
                viewUrl={viewUrl(props, item, formRouteSegments)}
                editUrl={item.id ? `${basePath}/${formRouteSegments.edit}/${item.id}` : undefined}
                onEdit={customEditFunction && item.id ? () => customEditFunction(item.id) : undefined}
                onDelete={() => deleteRecord(item)}
            />
        )
    };
    const effectiveColumns = settings.canShowActions ? [...columns, actionsColumn] : columns;

    if (error) {
        return <ErrorAlert title={messages.common.loadError} message={String(error)} />;
    }

    return (
        <ViewTable
            data={data}
            columns={effectiveColumns}
            loading={loading}
            pagination={props.pagination}
            externalState={tableState}
            // Highlights the row under the mouse, to show that clicking it opens the record, as the view icon does.
            highlightOnHover
            highlightOnHoverColor={ROW_HOVER_COLOR}
            onRowClick={({ record }) => navigate(viewUrl(props, record, formRouteSegments))}
        />
    );
};

export default TableView;
