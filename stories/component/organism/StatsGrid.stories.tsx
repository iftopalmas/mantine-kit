import type { Meta, StoryObj } from '@storybook/react-vite';

import StatsGrid from '@/src/component/organism/StatsGrid/StatsGrid';

const meta = {
    title: 'Organisms/StatsGrid',
    component: StatsGrid,
    args: {
        data: [
            { title: 'Revenue', value: '$ 13,456', diff: 34, period: 'Monthly' },
            { title: 'Customers', value: '4,145', diff: 13 },
            { title: 'Losses', value: '745 m³', diff: -18 },
            { title: 'Coverage', value: '92%', diff: 2 }
        ],
        paperProps: { p: 'md', withBorder: true }
    }
} satisfies Meta<typeof StatsGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = { args: { loading: true } };

export const WithError: Story = { args: { error: 'Request failed with status code 500' } };
