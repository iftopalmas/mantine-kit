import type { Meta, StoryObj } from '@storybook/react-vite';

import ErrorAlert from '@/src/component/atom/ErrorAlert/ErrorAlert';

const meta = {
    title: 'Atoms/ErrorAlert',
    component: ErrorAlert,
    args: { title: 'Error loading data', message: 'Request failed with status code 500' }
} satisfies Meta<typeof ErrorAlert>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
