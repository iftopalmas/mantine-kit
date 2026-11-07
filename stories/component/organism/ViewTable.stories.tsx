import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import ViewTable from '@/src/component/organism/ViewTable/ViewTable';
import { Region, REGIONS } from '../../fixtures';

/** Many records, to show the pagination. */
const MANY_REGIONS: Region[] = Array.from({ length: 42 }, (_, i) => ({
    id: i + 1,
    name: `${REGIONS[i % REGIONS.length].name} ${Math.floor(i / REGIONS.length) + 1}`,
    cities: (i * 7) % 50
}));

const meta = {
    title: 'Organisms/ViewTable',
    component: ViewTable<Region>,
    args: {
        data: MANY_REGIONS,
        columns: [
            { accessor: 'name', title: 'Name', sortable: true },
            { accessor: 'cities', title: 'Cities', sortable: true }
        ]
    }
} satisfies Meta<typeof ViewTable<Region>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutPagination: Story = { args: { data: REGIONS, pagination: false } };

export const Empty: Story = { args: { data: [] } };

export const Loading: Story = { args: { data: [], loading: true } };

/** Pagination and sort kept outside the table (e.g. by a backend): the records are shown as received. */
export const ExternalState: Story = {
    args: {
        data: MANY_REGIONS.slice(10, 20),
        externalState: {
            page: 2,
            pageSize: 10,
            sortStatus: { columnAccessor: 'id', direction: 'asc' },
            totalRecords: MANY_REGIONS.length,
            onPageChange: fn(),
            onPageSizeChange: fn(),
            onSortStatusChange: fn()
        }
    }
};
