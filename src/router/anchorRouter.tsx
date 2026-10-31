import { forwardRef } from 'react';

import { RouterAdapter, RouterLinkProps } from './RouterAdapter';

/** Plain HTML link: reloads the page when navigating. */
const AnchorLink = forwardRef<HTMLAnchorElement, RouterLinkProps>((props, ref) => <a ref={ref} {...props} />);
AnchorLink.displayName = 'AnchorLink';

/**
 * Default router, used when the app gives none to the `KitProvider`: plain links (`<a>`) and navigation through
 * `window.location`. It works in any app, but reloads the page on every navigation; apps with a router (Next.js,
 * React Router) should give their own adapter.
 */
export const anchorRouter: RouterAdapter = {
    Link: AnchorLink,
    usePathname: () => (typeof window === 'undefined' ? '/' : window.location.pathname),
    useNavigate: () => (url: string) => window.location.assign(url)
};
