import {
    ActionIcon,
    AppShell,
    Avatar,
    Burger,
    Container,
    Group,
    Menu,
    Tooltip,
    UnstyledButton,
    useComputedColorScheme,
    useMantineColorScheme,
    useMantineTheme
} from '@mantine/core';
import { useDisclosure, useMediaQuery, useMounted } from '@mantine/hooks';
import { IconMoon, IconSun } from '@tabler/icons-react';
import cx from 'clsx';

import AppMain from '../../atom/AppMain/AppMain';
import Navbar from '../../organism/Navbar/Navbar';
import { NavItem } from '../../organism/Navbar/NavItem';
import { useKitMessages } from '../../../provider/useKit';
import classes from './Layout.module.css';

interface Props {
    children: React.ReactNode;

    /** Brand of the app in the header (e.g. the logo with a link to the home page). */
    logo: React.ReactNode;

    /** Items of the side menu. */
    navItems: NavItem[];

    /** Content fixed at the bottom of the side menu (e.g. a link to log out). */
    navFooter?: React.ReactNode;

    /**
     * Items of the user menu (e.g. `Menu.Item`s for the profile and to log out), opened by the avatar in the header.
     * Without them, the avatar is not shown.
     */
    userMenu?: React.ReactNode;
}

/**
 * Structure of the pages of the app: header with the brand, the color scheme toggle and the user menu, collapsible side
 * menu and the content area.
 */
export const Layout = ({ children, logo, navItems, navFooter, userMenu }: Props) => {
    const messages = useKitMessages().layout;
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const { setColorScheme } = useMantineColorScheme();
    const savedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
    /* The server does not know the color scheme saved in the browser and always renders the light one. Using the saved
       scheme only after mounting keeps the button label equal to the server HTML (avoiding a hydration error). */
    const computedColorScheme = useMounted() ? savedColorScheme : 'light';
    const nextColorScheme = computedColorScheme === 'light' ? 'dark' : 'light';
    const colorSchemeLabel = nextColorScheme === 'dark' ? messages.enableDarkTheme : messages.enableLightTheme;

    const theme = useMantineTheme();
    const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
    const isMobile = !isDesktop;
    const isOpened = isMobile ? mobileOpened : desktopOpened;
    const toggleBurgerFn = isMobile ? toggleMobile : toggleDesktop;

    return (
        <AppShell
            header={{ height: { base: 60, sm: 68 } }}
            navbar={{
                width: { base: 300 },
                breakpoint: 'sm',
                collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }
            }}
            padding={0}
        >
            <AppShell.Header>
                <Group h="100%" justify="space-between" wrap="nowrap" gap="xs" px={{ base: 'xs', sm: 'md' }}>
                    <Group wrap="nowrap" className={cx(classes.shrinkable, classes.headerGap)}>
                        <Burger
                            opened={isOpened}
                            onClick={toggleBurgerFn}
                            size="sm"
                            aria-label={isOpened ? messages.collapseNavigation : messages.expandNavigation}
                            aria-expanded={isOpened}
                            className={classes.fixed}
                        />

                        {logo}
                    </Group>

                    <Group wrap="nowrap" gap="xs" className={classes.fixed}>
                        <Tooltip label={colorSchemeLabel}>
                            <ActionIcon
                                onClick={() => setColorScheme(nextColorScheme)}
                                variant="subtle"
                                size={40}
                                radius="xl"
                                aria-label={colorSchemeLabel}
                            >
                                <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
                                <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>

                        {userMenu && (
                            <Menu shadow="lg" width={200}>
                                {/* The Tooltip stays outside the Menu.Target: in Mantine 9, the Menu.Target passes the menu
                                    props to its direct child, and they would go to the Tooltip instead of the button. */}
                                <Tooltip label={messages.userMenu}>
                                    <Menu.Target>
                                        <UnstyledButton aria-label={messages.userMenu} style={{ borderRadius: '50%' }}>
                                            <Avatar color={theme.primaryColor} radius="xl" size={40} />
                                        </UnstyledButton>
                                    </Menu.Target>
                                </Tooltip>
                                <Menu.Dropdown>
                                    <Menu.Label tt="uppercase" ta="center" fw={600}>
                                        {messages.userMenuTitle}
                                    </Menu.Label>
                                    {userMenu}
                                </Menu.Dropdown>
                            </Menu>
                        )}
                    </Group>
                </Group>
            </AppShell.Header>

            <Navbar items={navItems} footer={navFooter} linkClickHandler={() => isMobile && toggleBurgerFn()} />

            <AppShell.Main>
                <AppMain>
                    <Container p="md" fluid>
                        {children}
                    </Container>
                </AppMain>
            </AppShell.Main>
        </AppShell>
    );
};
