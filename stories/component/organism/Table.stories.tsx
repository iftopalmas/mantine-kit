import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentType } from 'react';
import { fn } from 'storybook/test';

import Table from '@/src/component/organism/Table/Table';
import { Region, regionListSource, regionPageSource } from '../../fixtures';
import { ClientRegionTable, REGION_COLUMNS, RegionTableProps, ServerRegionTable } from '../../RegionTables';

const regions = regionListSource();
const pagedRegions = regionPageSource();

/** Fetch that always fails, as an API that answers with an error. */
const failingFetch = (): Promise<Region[]> => Promise.reject(new Error('Request failed with status code 500'));

/** Args of the stories: the props of the Table, plus the arguments of `useClientPagination`. */
type TableStoryArgs = RegionTableProps & { fetchAll: () => Promise<Region[]>; pagination?: boolean };

/**
 * The `data` prop comes from `useClientPagination(fetchAll)`, which sorts and paginates in the browser, or from
 * `useServerPagination(fetchPage)`, which leaves it to the backend.
 */
const meta = {
    title: 'Organisms/Table',
    // The Docs page shows the props of the Table, but the args also have the ones of the hook, so the type is cast.
    component: Table as unknown as ComponentType<TableStoryArgs>,
    args: { service: regions, fetchAll: regions.findAll, basePath: '/region', columns: REGION_COLUMNS },
    render: args => <ClientRegionTable {...args} />
} satisfies Meta<TableStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Delete a record to see the confirmation dialog and the notification. */
export const Default: Story = {};

export const WithoutPagination: Story = { args: { pagination: false } };

/** The edit action calls a function (e.g. to edit the row in place) instead of opening the edit page. */
export const CustomEdit: Story = { args: { customEditFunction: fn() } };

export const OnlyView: Story = { args: { actionsSettings: { canEdit: false, canDelete: false } } };

export const LoadError: Story = { args: { fetchAll: failingFetch } };

/** The backend sorts and paginates: `useServerPagination` fetches one page at a time. */
export const ServerSidePagination: Story = {
    render: ({ basePath, columns }) => (
        <ServerRegionTable
            service={pagedRegions}
            fetchPage={pagedRegions.fetchPage}
            basePath={basePath}
            columns={columns}
        />
    )
};
