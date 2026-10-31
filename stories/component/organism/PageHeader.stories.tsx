import type { Meta, StoryObj } from '@storybook/react-vite';

import PageHeader from '@/src/component/organism/PageHeader/PageHeader';

const meta = {
    title: 'Organisms/PageHeader',
    component: PageHeader,
    args: { title: 'Regions', breadcrumbItems: [{ title: 'Regions', href: '#' }] }
} satisfies Meta<typeof PageHeader>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

/** List page header, with the "Add" button and the breadcrumb starting at the home page. */
export const WithAddButton: StoryObj<typeof meta> = { args: { addActionRoute: '/region/create' } };
