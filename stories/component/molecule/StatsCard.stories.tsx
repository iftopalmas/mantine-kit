import type { Meta, StoryObj } from '@storybook/react-vite';

import StatsCard from '@/src/component/molecule/StatsCard/StatsCard';

const meta = {
    title: 'Molecules/StatsCard',
    component: StatsCard,
    args: { data: { title: 'Revenue', value: '$ 13,456', diff: 34, period: 'Monthly' }, p: 'md', withBorder: true }
} satisfies Meta<typeof StatsCard>;

export default meta;

export const Increase: StoryObj<typeof meta> = {};

export const Decrease: StoryObj<typeof meta> = {
    args: { data: { title: 'Losses', value: '1,234 m³', diff: -12 } }
};
