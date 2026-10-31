import { beforeEach, describe, expect, test } from '@jest/globals';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Menu } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';

import { Layout } from '@/src/component/template/Layout/Layout';
import { KitProvider } from '@/src/provider/KitProvider';
import { render } from '@/test-utils/render';

/** Brand of the test app: a single link to the home page. */
const logo = (
    <a href="/" aria-label="Test App — home">
        Test App
    </a>
);

/**
 * Renders the layout with the brand, an item in the side menu and, optionally, the user menu.
 * @param children content of the page
 * @param withUserMenu whether the user menu is shown
 */
function renderLayout(children: React.ReactNode, withUserMenu: boolean = true): void {
    render(
        <Layout
            logo={logo}
            navItems={[{ link: '/', label: 'Home', icon: IconHome }]}
            userMenu={withUserMenu && <Menu.Item>Profile</Menu.Item>}
        >
            {children}
        </Layout>
    );
}

describe('Layout', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    test('exposes the brand as a single link and keeps the headings of the content', () => {
        renderLayout(<h1>Indicators</h1>);

        const header = within(screen.getByRole('banner'));
        expect(header.getByRole('link', { name: 'Test App — home' })).toHaveAttribute('href', '/');
        expect(header.getAllByRole('link')).toHaveLength(1);
        expect(header.queryByRole('heading')).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Indicators', level: 1 })).toBeInTheDocument();
    });

    test('keeps tooltip and accessible name in sync when toggling the color scheme', async () => {
        const user = userEvent.setup();
        renderLayout('Content');

        const button = screen.getByRole('button', { name: 'Enable dark theme' });
        await user.hover(button);
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Enable dark theme');
        await user.click(button);
        expect(screen.getByRole('button', { name: 'Enable light theme' })).toBe(button);
        expect(screen.getByRole('tooltip')).toHaveTextContent('Enable light theme');
        expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark');

        await user.click(button);
        expect(button).toHaveAccessibleName('Enable dark theme');
        expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'light');
    });

    test('keeps the profile label in sync and allows opening the menu', async () => {
        const user = userEvent.setup();
        renderLayout('Content');

        const button = screen.getByRole('button', { name: 'Open user options' });
        await user.hover(button);
        expect(await screen.findByRole('tooltip')).toHaveTextContent(button.getAttribute('aria-label')!);
        await user.click(button);
        await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Profile' })).toBeVisible());
    });

    test('does not show the avatar when the app gives no user menu', () => {
        renderLayout('Content', false);

        expect(screen.queryByRole('button', { name: 'Open user options' })).not.toBeInTheDocument();
    });

    test('updates the accessible state when opening and closing the mobile navigation', async () => {
        const user = userEvent.setup();
        renderLayout('Content');

        const button = screen.getByRole('button', { name: 'Expand navigation menu' });
        expect(button).toHaveAttribute('aria-expanded', 'false');
        await user.click(button);
        expect(button).toHaveAccessibleName('Collapse navigation menu');
        expect(button).toHaveAttribute('aria-expanded', 'true');
        await user.click(within(screen.getByRole('navigation')).getByRole('link', { name: 'Home' }));
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    test('uses the texts of the locale of the app', () => {
        render(
            <KitProvider locale="pt-BR">
                <Layout logo={logo} navItems={[]}>
                    Content
                </Layout>
            </KitProvider>
        );

        expect(screen.getByRole('button', { name: 'Ativar tema escuro' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Expandir menu de navegação' })).toBeInTheDocument();
    });
});
