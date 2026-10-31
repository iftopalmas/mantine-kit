import type { Meta, StoryObj } from '@storybook/react-vite';

import { NumberInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

import CreateFormPage from '@/src/component/template/CreateFormPage/CreateFormPage';
import EditFormPage from '@/src/component/template/EditFormPage/EditFormPage';
import FormPage from '@/src/component/template/FormPage/FormPage';
import { FormType } from '@/src/component/template/FormPage/FormType';
import ViewPage from '@/src/component/template/ViewPage/ViewPage';
import { Region, regionSaveSource, REGIONS } from '../../fixtures';

type Props = { formType: FormType };

/** Form page of a region, in the mode chosen in the controls. */
function RegionFormPage({ formType }: Props): React.ReactElement {
    const form = useForm<Region>({
        initialValues: formType === FormType.Create ? { name: '', cities: 0 } : REGIONS[0]
    });
    const readOnly = formType === FormType.View;

    return (
        <FormPage service={regionSaveSource} title="Region" form={form} formType={formType} backRoute="/region">
            <TextInput label="Name" readOnly={readOnly} {...form.getInputProps('name')} />
            <NumberInput label="Cities" readOnly={readOnly} {...form.getInputProps('cities')} />
        </FormPage>
    );
}

const meta = {
    title: 'Templates/FormPage',
    component: RegionFormPage,
    argTypes: { formType: { control: 'radio', options: [FormType.Create, FormType.Edit, FormType.View] } },
    args: { formType: FormType.Create }
} satisfies Meta<typeof RegionFormPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {};

export const Edit: Story = { args: { formType: FormType.Edit } };

export const View: Story = { args: { formType: FormType.View } };

/** `CreateFormPage`: creates a record with a given function, with a confirmation. */
export const CreateFormPageStory: Story = {
    name: 'CreateFormPage',
    render: function Render() {
        const form = useForm<Region>({ initialValues: { name: '', cities: 0 } });

        return (
            <CreateFormPage
                title="Region"
                breadcrumbItems={[{ title: 'Regions', href: '/region' }]}
                fetchMethod={data => regionSaveSource.save(undefined, data)}
                form={form}
                backRoute="/region"
                confirmationMessage="Do you want to create the region?"
            >
                <TextInput label="Name" {...form.getInputProps('name')} />
            </CreateFormPage>
        );
    }
};

/** `EditFormPage`: updates a record with a given function. */
export const EditFormPageStory: Story = {
    name: 'EditFormPage',
    render: function Render() {
        const form = useForm<Region>({ initialValues: REGIONS[0] });

        return (
            <EditFormPage
                title="Region"
                breadcrumbItems={[{ title: 'Regions', href: '/region' }]}
                fetchMethod={data => regionSaveSource.save(1, data)}
                form={form}
                backRoute="/region"
            >
                <TextInput label="Name" {...form.getInputProps('name')} />
            </EditFormPage>
        );
    }
};

/** `ViewPage`: shows a record, with the back button. */
export const ViewPageStory: Story = {
    name: 'ViewPage',
    render: () => (
        <ViewPage title="Region" breadcrumbItems={[{ title: 'Regions', href: '/region' }]} backRoute="/region">
            {`${REGIONS[0].name}: ${REGIONS[0].cities} cities`}
        </ViewPage>
    )
};
