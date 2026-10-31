import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { Group } from '@mantine/core';

import CancelEditButton from '@/src/component/atom/CancelEditButton/CancelEditButton';
import ConfirmEditButton from '@/src/component/atom/ConfirmEditButton/ConfirmEditButton';
import EditValueButton from '@/src/component/atom/EditValueButton/EditValueButton';

/** The three buttons used to edit a table row in place: edit, confirm and cancel. */
const meta = {
    title: 'Atoms/Row edit buttons',
    component: ConfirmEditButton,
    args: { onClick: fn(), disabled: false }
} satisfies Meta<typeof ConfirmEditButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ConfirmEdit: Story = {};

export const ConfirmEditDisabled: Story = { args: { disabled: true } };

export const AllButtons: Story = {
    render: args => (
        <Group gap="xs">
            <EditValueButton onClick={args.onClick} />
            <ConfirmEditButton {...args} />
            <CancelEditButton onClick={args.onClick} />
        </Group>
    )
};
