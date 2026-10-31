import type { Meta, StoryObj } from '@storybook/react-vite';

import { Menu, Text, Title } from '@mantine/core';
import { IconLogout, IconUser } from '@tabler/icons-react';

import { Layout } from '@/src/component/template/Layout/Layout';
import { NAV_ITEMS } from '../organism/Navbar.stories';

const meta = {
    title: 'Templates/Layout',
    component: Layout,
    parameters: { layout: 'fullscreen' },
    args: {
        logo: (
            <Title order={4} c="var(--mantine-primary-color-filled)">
                My System
            </Title>
        ),
        navItems: NAV_ITEMS,
        userMenu: (
            <>
                <Menu.Item leftSection={<IconUser size={16} />}>Profile</Menu.Item>
                <Menu.Item leftSection={<IconLogout size={16} />}>Log out</Menu.Item>
            </>
        ),
        children: <Text>Content of the page.</Text>
    }
} satisfies Meta<typeof Layout>;

export default meta;

export const Default: StoryObj<typeof meta> = {};

/** Without a user menu, the avatar is not shown. */
export const WithoutUserMenu: StoryObj<typeof meta> = { args: { userMenu: undefined } };
