import { ReactElement, ReactNode } from 'react';

import { Group, Stack, Text } from '@mantine/core';

import { useDocumentTitle, useKitMessages } from '../../../provider/useKit';
import { BreadcrumbItem } from '../../molecule/Breadcrumb/Breadcrumb';
import PaperCard from '../../molecule/PaperCard/PaperCard';
import PageHeader from '../../organism/PageHeader/PageHeader';

/** Props of the {@link ListPage}. */
type ListPageProps = {
    /** Title of the page (e.g. "Regions"). */
    title: string;

    /** Plural name of the records, used in the title of the table card. */
    titlePlural: string;
    breadcrumbItems: BreadcrumbItem[];

    /** Route of the "Add" button; absent for no button. */
    addActionRoute?: string;

    /** Extra content above the table (e.g. filters). */
    filters?: ReactNode;

    /** Table of the records (e.g. a `Table`). */
    children: ReactNode;
};

/**
 * List page of records: header with the "Add" button, optional filters and the table of the records, given as
 * children, inside a card.
 */
function ListPage({
    title,
    titlePlural,
    breadcrumbItems,
    addActionRoute,
    filters,
    children
}: ListPageProps): ReactElement {
    const documentTitle = useDocumentTitle(title);
    const messages = useKitMessages();

    return (
        <>
            <title>{documentTitle}</title>
            <Stack gap="lg">
                <PageHeader title={title} breadcrumbItems={breadcrumbItems} addActionRoute={addActionRoute} />
                {filters && <Stack>{filters}</Stack>}
                <PaperCard>
                    <Group justify="space-between" mb="md">
                        <Text fz="lg" fw={600}>
                            {messages.table.listTitle(titlePlural)}
                        </Text>
                    </Group>
                    {children}
                </PaperCard>
            </Stack>
        </>
    );
}

export default ListPage;
