import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import DataTableView from '@/src/component/organism/ViewTable/DataTableView';
import { Region, REGIONS } from '../../fixtures';

/** Total of records of all pages, as a backend would answer. */
const TOTAL_RECORDS = 42;

/**
 * Shows the records as received, with the pagination and sort given by the caller. `ViewTable` and `Table` use it, so
 * apps rarely need it directly.
 */
const meta = {
    title: 'Organisms/DataTableView',
    component: DataTableView<Region>,
    args: {
        records: REGIONS,
        paginated: true,
        columns: [
            { accessor: 'name', title: 'Name', sortable: true },
            { accessor: 'cities', title: 'Cities', sortable: true }
        ],
        state: {
            page: 2,
            pageSize: 10,
            sortStatus: { columnAccessor: 'id', direction: 'asc' },
            totalRecords: TOTAL_RECORDS,
            onPageChange: fn(),
            onPageSizeChange: fn(),
            onSortStatusChange: fn()
        }
    }
} satisfies Meta<typeof DataTableView<Region>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The second page of a set paginated elsewhere: the records are shown as received. */
export const Default: Story = {};

export const Loading: Story = { args: { records: [], loading: true } };
