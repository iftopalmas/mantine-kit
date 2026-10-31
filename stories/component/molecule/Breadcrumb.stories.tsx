import type { Meta, StoryObj } from '@storybook/react-vite';

import Breadcrumb from '@/src/component/molecule/Breadcrumb/Breadcrumb';

const meta = {
    title: 'Molecules/Breadcrumb',
    component: Breadcrumb,
    args: {
        items: [
            { title: 'Home', href: '/' },
            { title: 'Regions', href: '/region' },
            { title: 'Edit Region', href: '#' }
        ]
    }
} satisfies Meta<typeof Breadcrumb>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
