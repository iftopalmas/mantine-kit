import type { Meta, StoryObj } from '@storybook/react-vite';

import AppMain from '@/src/component/atom/AppMain/AppMain';

const meta = {
    title: 'Atoms/AppMain',
    component: AppMain,
    args: { children: 'Content of the page, over the page background of the light and dark themes.' }
} satisfies Meta<typeof AppMain>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
