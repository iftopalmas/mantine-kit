import type { Meta, StoryObj } from '@storybook/react-vite';

import PaperCard from '@/src/component/molecule/PaperCard/PaperCard';

const meta = {
    title: 'Molecules/PaperCard',
    component: PaperCard,
    args: { children: 'Content grouped in a card' }
} satisfies Meta<typeof PaperCard>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
