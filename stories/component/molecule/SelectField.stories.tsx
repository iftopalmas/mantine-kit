import type { Meta, StoryObj } from '@storybook/react-vite';

import { SelectField } from '@/src/component/molecule/SelectField/SelectField';

type City = { id: number; name: string };

const CITIES: City[] = [
    { id: 1, name: 'Palmas' },
    { id: 2, name: 'Araguaína' },
    { id: 3, name: 'Gurupi' }
];

const meta = {
    title: 'Molecules/SelectField',
    component: SelectField<City, number>,
    args: {
        label: 'City',
        data: CITIES,
        getId: city => city.id,
        getDescription: city => city.name,
        w: 280
    }
} satisfies Meta<typeof SelectField<City, number>>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The placeholder and the "not found" text are built from the label, in the language of the locale. */
export const Default: Story = {};

export const NotSearchable: Story = { args: { searchable: false } };
