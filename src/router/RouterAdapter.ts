import { CSSProperties, ForwardRefExoticComponent, MouseEventHandler, ReactNode, RefAttributes } from 'react';

/** Props the library components pass to the link component of the router. */
export interface RouterLinkProps {
    href: string;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Bridge between the library and the router of the app (Next.js, React Router or another one). The components import
 * no router: they navigate and build links only through this contract, given to the `KitProvider`.
 */
export interface RouterAdapter {
    /**
     * Link component of the router. It receives the destination in `href` (the adapter converts it, e.g. to the `to`
     * of React Router) and forwards the `ref` to the `<a>`, which Mantine uses to place tooltips.
     */
    Link: ForwardRefExoticComponent<RouterLinkProps & RefAttributes<HTMLAnchorElement>>;

    /** Hook that returns the path of the current page (e.g. `/region`), without the query string. */
    usePathname: () => string;

    /** Hook that returns the function that navigates to a URL. */
    useNavigate: () => (url: string) => void;
}
