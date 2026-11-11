import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextInput } from '@mantine/core';

import ListPage from '@/src/component/template/ListPage/ListPage';
import { regionListSource, regionPageSource } from '../../fixtures';
import { ClientRegionTable, REGION_COLUMNS, ServerRegionTable } from '../../RegionTables';

const regions = regionListSource();
const pagedRegions = regionPageSource();

const meta = {
    title: 'Templates/ListPage',
    component: ListPage,
    args: {
        title: 'Regions',
        titlePlural: 'Regions',
        breadcrumbItems: [{ title: 'Regions', href: '#' }],
        addActionRoute: '/region/create',
        children: <ClientRegionTable service={regions} source={regions} basePath="/region" columns={REGION_COLUMNS} />
    }
} satisfies Meta<typeof ListPage>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

/** Extra content above the table, such as filters. */
export const WithFilters: StoryObj<typeof meta> = {
    args: { filters: <TextInput label="Name" placeholder="Filter by name" w={280} /> }
};

/** The backend sorts and paginates: `useServerPagination` fetches one page at a time. */
export const ServerSidePagination: StoryObj<typeof meta> = {
    args: {
        children: (
            <ServerRegionTable
                service={pagedRegions}
                source={pagedRegions}
                basePath="/region"
                columns={REGION_COLUMNS}
            />
        )
    }
};
