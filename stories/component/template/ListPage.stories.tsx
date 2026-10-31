import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextInput } from '@mantine/core';

import ListPage from '@/src/component/template/ListPage/ListPage';
import { ListDataSource } from '@/src/data/ListDataSource';
import { Region, regionListSource } from '../../fixtures';

const meta = {
    title: 'Templates/ListPage',
    component: ListPage<Region, ListDataSource<Region>>,
    args: {
        title: 'Regions',
        titlePlural: 'Regions',
        breadcrumbItems: [{ title: 'Regions', href: '#' }],
        addActionRoute: '/region/create',
        service: regionListSource(),
        resourceBasePath: '/region',
        tableColumns: [
            { accessor: 'name', title: 'Name', sortable: true },
            { accessor: 'cities', title: 'Cities', sortable: true }
        ]
    }
} satisfies Meta<typeof ListPage<Region, ListDataSource<Region>>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

/** Extra content above the table, such as filters. */
export const WithFilters: StoryObj<typeof meta> = {
    args: { children: <TextInput label="Name" placeholder="Filter by name" w={280} /> }
};
