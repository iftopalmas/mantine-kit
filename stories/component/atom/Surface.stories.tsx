import type { Meta, StoryObj } from '@storybook/react-vite';

import { Paper } from '@mantine/core';

import Surface from '@/src/component/atom/Surface/Surface';

const meta = {
    title: 'Atoms/Surface',
    component: Surface,
    args: { children: 'Content of a polymorphic container' }
} satisfies Meta<typeof Surface>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

/** Rendered as a Mantine `Paper`, as cards and page headers do. */
export const AsPaper: StoryObj<typeof meta> = {
    render: () => (
        <Surface component={Paper} p="md" withBorder>
            Content rendered as a Mantine Paper
        </Surface>
    )
};
