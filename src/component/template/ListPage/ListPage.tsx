import { ReactElement, ReactNode } from 'react';

import { Group, Stack, Text } from '@mantine/core';
import { DataTableColumn } from 'mantine-datatable';

import { ListDataSource } from '../../../data/ListDataSource';
import { Identifiable } from '../../../model/Identifiable';
import { useDocumentTitle, useKitMessages } from '../../../provider/useKit';
import { BreadcrumbItem } from '../../molecule/Breadcrumb/Breadcrumb';
import PaperCard from '../../molecule/PaperCard/PaperCard';
import PageHeader from '../../organism/PageHeader/PageHeader';
import Table, { ActionsSettings } from '../../organism/Table/Table';

interface ListPageProps<T, S> {
    /** Title of the page (e.g. "Regions"). */
    title: string;

    /** Plural name of the records, used in the title of the table card. */
    titlePlural: string;
    breadcrumbItems: BreadcrumbItem[];

    /** Route of the "Add" button; absent for no button. */
    addActionRoute?: string;

    /** Source of the records and of their deletion. */
    service: S;
    tableColumns: DataTableColumn<T>[];

    /** Base path of the pages of the records (e.g. `/region`). */
    resourceBasePath: string;
    actionsSettings?: Partial<ActionsSettings>;

    /** Extra content above the table (e.g. filters). */
    children?: ReactNode;
    customFetchMethod?: () => Promise<T[]>;

    /** Builds the URL opened to view a record. If absent, the default view route is used. */
    getViewUrl?: (item: T) => string;
}

/**
 * List page of records: header with the "Add" button, optional extra content (e.g. filters) and the table of the
 * records, with the view, edit and delete actions.
 */
function ListPage<M extends Identifiable, S extends ListDataSource<M>>(props: ListPageProps<M, S>): ReactElement {
    const {
        title,
        titlePlural,
        breadcrumbItems,
        addActionRoute,
        service,
        tableColumns,
        resourceBasePath,
        actionsSettings,
        children,
        customFetchMethod,
        getViewUrl
    } = props;
    const documentTitle = useDocumentTitle(title);
    const messages = useKitMessages();

    return (
        <>
            <title>{documentTitle}</title>
            <Stack gap="lg">
                <PageHeader title={title} breadcrumbItems={breadcrumbItems} addActionRoute={addActionRoute} />
                {children && <Stack>{children}</Stack>}
                <PaperCard>
                    <Group justify="space-between" mb="md">
                        <Text fz="lg" fw={600}>
                            {messages.table.listTitle(titlePlural)}
                        </Text>
                    </Group>
                    <Table<M, S>
                        service={service}
                        basePath={resourceBasePath}
                        columns={tableColumns}
                        customFetchMethod={customFetchMethod}
                        actionsSettings={actionsSettings}
                        getViewUrl={getViewUrl}
                    />
                </PaperCard>
            </Stack>
        </>
    );
}

export default ListPage;
