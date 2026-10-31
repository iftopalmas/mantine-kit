import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import RowActions from '@/src/component/organism/Table/RowActions';

const meta = {
    title: 'Organisms/RowActions',
    component: RowActions,
    args: {
        canView: true,
        canEdit: true,
        canDelete: true,
        viewUrl: '/region/view/1',
        editUrl: '/region/edit/1',
        onDelete: fn()
    }
} satisfies Meta<typeof RowActions>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
