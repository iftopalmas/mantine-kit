import type { Meta, StoryObj } from '@storybook/react-vite';

import PrintSection from '@/src/component/molecule/PrintSection/PrintSection';

const meta = {
    title: 'Molecules/PrintSection',
    component: PrintSection,
    args: { title: 'Revenue', newPage: false, children: 'Tables and charts of the section.' }
} satisfies Meta<typeof PrintSection>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

/** Starts on a new page when printed. */
export const OnNewPage: StoryObj<typeof meta> = { args: { newPage: true } };
