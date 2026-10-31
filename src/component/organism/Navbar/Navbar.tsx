import { ReactElement, ReactNode } from 'react';

import { AppShell, NavLink } from '@mantine/core';

import { useKitRouter } from '../../../provider/useKit';
import classes from './Navbar.module.css';
import { NavItem } from './NavItem';

type NavbarProps = {
    /** Items of the menu, in the display order. */
    items: NavItem[];

    /** Content fixed at the bottom of the menu (e.g. a link to log out). */
    footer?: ReactNode;

    /** Called when a link is clicked (e.g. to close the menu on mobile devices). */
    linkClickHandler?: () => void;
};

type MenuItemProps = {
    item: NavItem;

    /** Called when a link is clicked. */
    linkClickHandler?: () => void;
};

/**
 * Tells whether the item, or an item inside it (for a group), opens the current page.
 * @param item item of the menu
 * @param pathname path of the current page
 * @return `true` if the item holds the current page
 */
export function containsCurrentPage(item: NavItem, pathname: string): boolean {
    return item.link === pathname || (item.children ?? []).some(child => containsCurrentPage(child, pathname));
}

/**
 * Item of the side menu: a link to a page or, if it has `children`, a collapsible group with its items. The group
 * starts open when it holds the current page, and the item of the current page is highlighted.
 */
function MenuItem({ item, linkClickHandler }: MenuItemProps): ReactElement {
    const { Link, usePathname } = useKitRouter();
    const pathname = usePathname();
    const icon = <item.icon stroke={1.5} />;
    if (item.children) {
        return (
            // A button, and not a link without destination, so the group can be opened with the keyboard.
            <NavLink
                component="button"
                label={item.label}
                leftSection={icon}
                defaultOpened={containsCurrentPage(item, pathname)}
                className={classes.link}
            >
                {item.children.map(child => (
                    <MenuItem key={child.label} item={child} linkClickHandler={linkClickHandler} />
                ))}
            </NavLink>
        );
    }

    return (
        <NavLink
            component={Link}
            href={item.link ?? '#'}
            active={item.link === pathname}
            label={item.label}
            leftSection={icon}
            className={classes.link}
            onClick={linkClickHandler}
        />
    );
}

/** Side menu of the {@link Layout}: links to the pages and collapsible groups, with the current page highlighted. */
export function Navbar({ items, footer, linkClickHandler }: NavbarProps): ReactElement {
    return (
        <AppShell.Navbar p="md" className={classes.navbar}>
            <div className={classes.navbarMain}>
                {items.map(item => (
                    <div key={item.label}>
                        <MenuItem item={item} linkClickHandler={linkClickHandler} />
                    </div>
                ))}
            </div>

            {footer && <div className={classes.footer}>{footer}</div>}
        </AppShell.Navbar>
    );
}

export default Navbar;
