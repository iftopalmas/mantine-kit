import type { Meta, StoryObj } from '@storybook/react-vite';

import { Text } from '@mantine/core';

import DataTabList from '@/src/component/organism/DataTabList/DataTabList';
import { Region, REGIONS } from '../../fixtures';

const meta = {
    title: 'Organisms/DataTabList',
    component: DataTabList<Region>,
    args: {
        dataArray: REGIONS,
        tabTitleFn: region => region.name,
        children: region => <Text p="md">{`${region.name} has ${region.cities} cities.`}</Text>
    }
} satisfies Meta<typeof DataTabList<Region>>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
