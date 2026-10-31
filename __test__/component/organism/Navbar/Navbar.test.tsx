import { describe, expect, test } from '@jest/globals';
import { screen } from '@testing-library/react';

import { AppShell } from '@mantine/core';
import { IconChartBar, IconChartLine, IconHome, IconMap, IconMapPin } from '@tabler/icons-react';

import { containsCurrentPage, Navbar } from '@/src/component/organism/Navbar/Navbar';
import { NavItem } from '@/src/component/organism/Navbar/NavItem';
import { createTestRouter, render } from '@/test-utils';

const CHARTS_PATH = '/charts/indicators';
const MAP_PATH = '/charts/map';

const group: NavItem = {
    label: 'Charts',
    icon: IconChartBar,
    children: [
        { link: CHARTS_PATH, label: 'Indicators', icon: IconChartLine },
        { link: MAP_PATH, label: 'Supply map', icon: IconMapPin }
    ]
};

const items: NavItem[] = [
    { link: '/', label: 'Home', icon: IconHome },
    { link: '/district', label: 'Districts', icon: IconMap },
    group
];

/**
 * Returns the button of the "Charts" group in the menu.
 * @return the element of the group
 */
function chartsGroup(): HTMLElement {
    return screen.getByText('Charts').closest('.mantine-NavLink-root') as HTMLElement;
}

/**
 * Returns a link of the menu by its text, even inside a collapsible group (jsdom does not finish the Mantine
 * animation, so the items of the group are not accessible by the `link` role).
 * @param text text of the link
 * @return the link
 */
function link(text: string): HTMLElement {
    return screen.getByText(text).closest('a') as HTMLElement;
}

/**
 * Renders the menu inside the AppShell, which `AppShell.Navbar` requires.
 * @param pathname path of the current page
 * @param footer content of the bottom of the menu
 */
function renderNavbar(pathname: string, footer?: React.ReactNode): void {
    render(
        <AppShell navbar={{ width: 300, breakpoint: 'sm' }}>
            <Navbar items={items} footer={footer} />
        </AppShell>,
        { router: createTestRouter(pathname).router }
    );
}

describe('Navbar', () => {
    test('a group holds the current page when one of its items opens it', () => {
        expect(containsCurrentPage(group, CHARTS_PATH)).toBe(true);
        expect(containsCurrentPage(group, '/district')).toBe(false);
    });

    test('opens the "Charts" group with its links when the current page is in it', () => {
        renderNavbar(MAP_PATH);

        expect(chartsGroup().hasAttribute('data-expanded')).toBe(true);
        expect(link('Indicators').getAttribute('href')).toBe(CHARTS_PATH);
        expect(link('Supply map').getAttribute('href')).toBe(MAP_PATH);
        expect(link('Supply map').hasAttribute('data-active')).toBe(true);
    });

    test('keeps the group closed when the current page is not in it', () => {
        renderNavbar('/district');

        expect(chartsGroup().hasAttribute('data-expanded')).toBe(false);
        expect(link('Districts').hasAttribute('data-active')).toBe(true);
    });

    test('shows the footer only when given', () => {
        renderNavbar('/', <span>Log out</span>);

        expect(screen.getByText('Log out')).toBeInTheDocument();
    });
});
