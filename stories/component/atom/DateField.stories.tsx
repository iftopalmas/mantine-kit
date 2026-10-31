import type { Meta, StoryObj } from '@storybook/react-vite';

import { DateField } from '@/src/component/atom/DateField/DateField';

const meta = {
    title: 'Atoms/DateField',
    component: DateField,
    args: { label: 'Start date', w: 260 }
} satisfies Meta<typeof DateField>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
