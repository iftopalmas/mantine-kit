import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import Table from '@/src/component/organism/Table/Table';
import { ListDataSource } from '@/src/data/ListDataSource';
import { Region, regionListSource } from '../../fixtures';

const meta = {
    title: 'Organisms/Table',
    component: Table<Region, ListDataSource<Region>>,
    args: {
        service: regionListSource(),
        basePath: '/region',
        columns: [
            { accessor: 'name', title: 'Name', sortable: true },
            { accessor: 'cities', title: 'Cities', sortable: true }
        ]
    }
} satisfies Meta<typeof Table<Region, ListDataSource<Region>>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Delete a record to see the confirmation dialog and the notification. */
export const Default: Story = {};

/** The edit action calls a function (e.g. to edit the row in place) instead of opening the edit page. */
export const CustomEdit: Story = { args: { customEditFunction: fn() } };

export const OnlyView: Story = { args: { actionsSettings: { canEdit: false, canDelete: false } } };

export const LoadError: Story = {
    args: { customFetchMethod: () => Promise.reject(new Error('Request failed with status code 500')) }
};
