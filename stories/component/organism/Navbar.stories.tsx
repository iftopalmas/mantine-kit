import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppShell, NavLink } from '@mantine/core';
import { IconChartBar, IconChartLine, IconHome, IconLogout, IconMap } from '@tabler/icons-react';

import { Navbar } from '@/src/component/organism/Navbar/Navbar';
import { NavItem } from '@/src/component/organism/Navbar/NavItem';

/** Items of the menu, with a collapsible group. */
export const NAV_ITEMS: NavItem[] = [
    { link: '/', label: 'Home', icon: IconHome },
    { link: '/region', label: 'Regions', icon: IconMap },
    {
        label: 'Charts',
        icon: IconChartBar,
        children: [{ link: '/charts', label: 'Indicators', icon: IconChartLine }]
    }
];

const meta = {
    title: 'Organisms/Navbar',
    component: Navbar,
    args: { items: NAV_ITEMS },
    decorators: [
        Story => (
            <AppShell navbar={{ width: 300, breakpoint: 'sm' }}>
                <Story />
            </AppShell>
        )
    ]
} satisfies Meta<typeof Navbar>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

export const WithFooter: StoryObj<typeof meta> = {
    args: { footer: <NavLink href="#" label="Log out" leftSection={<IconLogout stroke={1.5} />} /> }
};
