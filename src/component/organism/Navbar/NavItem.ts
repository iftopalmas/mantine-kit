import { ComponentType } from 'react';

/**
 * Item of the side menu ({@link Navbar}). An item with `children` is a collapsible group, which does not navigate: only
 * its children have a `link`.
 */
export interface NavItem {
    /** Path of the page opened by the item; absent in the groups. */
    link?: string;
    label: string;

    /** Icon of the item (e.g. an icon of `@tabler/icons-react`). */
    icon: ComponentType<{ stroke?: number }>;

    /** Items of the group, shown below it when the group is open. */
    children?: NavItem[];
}
