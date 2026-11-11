import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentType } from 'react';
import { fn } from 'storybook/test';

import Table from '@/src/component/organism/Table/Table';
import { FetchAll } from '@/src/component/organism/Table/useClientPagination';
import { ListDataSource } from '@/src/data/ListDataSource';
import { Region, regionListSource, regionPageSource } from '../../fixtures';
import { ClientRegionTable, REGION_COLUMNS, RegionTableProps, ServerRegionTable } from '../../RegionTables';

const regions = regionListSource();
const pagedRegions = regionPageSource();

/** Fetch that always fails, as an API that answers with an error. */
const failingFetch = (): Promise<Region[]> => Promise.reject(new Error('Request failed with status code 500'));

/** Args of the stories: the props of the Table, plus the arguments of `useClientPagination`. */
type TableStoryArgs = RegionTableProps & { source: ListDataSource<Region> | FetchAll<Region>; pagination?: boolean };

/**
 * The `data` prop comes from `useClientPagination(source)`, which sorts and paginates in the browser, or from
 * `useServerPagination(source)`, which leaves it to the backend. The `source` is an object (e.g. a service) or a
 * function (e.g. a fetch with a filter).
 */
const meta = {
    title: 'Organisms/Table',
    // The Docs page shows the props of the Table, but the args also have the ones of the hook, so the type is cast.
    component: Table as unknown as ComponentType<TableStoryArgs>,
    args: { service: regions, source: regions, basePath: '/region', columns: REGION_COLUMNS },
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

/** The `source` is a function instead of an object, which fails as an API that answers with an error. */
export const LoadError: Story = { args: { source: failingFetch } };

/** The backend sorts and paginates: `useServerPagination` fetches one page at a time. */
export const ServerSidePagination: Story = {
    render: ({ basePath, columns }) => (
        <ServerRegionTable service={pagedRegions} source={pagedRegions} basePath={basePath} columns={columns} />
    )
};
