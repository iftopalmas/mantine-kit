import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import DataForm from '@/src/component/organism/DataForm/DataForm';
import { Region } from '../../fixtures';

type Props = { confirmationMessage?: string; onSubmit: (data: Region) => Promise<unknown> };

/** Form of a region, submitted with `onSubmit`. */
function RegionForm({ confirmationMessage, onSubmit }: Props): React.ReactElement {
    const form = useForm<Region>({ initialValues: { name: 'North', cities: 34 } });

    return (
        <DataForm
            title="Region"
            form={form}
            fetchMethod={onSubmit}
            submit={{ title: 'Save', successMsg: 'Region saved', errorMsg: 'Error saving region', confirmationMessage }}
        >
            <TextInput label="Name" {...form.getInputProps('name')} />
        </DataForm>
    );
}

const meta = {
    title: 'Organisms/DataForm',
    component: RegionForm,
    args: { onSubmit: fn<Props['onSubmit']>(() => Promise.resolve()) }
} satisfies Meta<typeof RegionForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Asks for a confirmation before submitting. */
export const WithConfirmation: Story = { args: { confirmationMessage: 'Do you want to save the region?' } };

/** The submission fails, and the error is shown in a notification. */
export const Failing: Story = {
    args: { onSubmit: fn<Props['onSubmit']>(() => Promise.reject(new Error('Server unavailable'))) }
};
