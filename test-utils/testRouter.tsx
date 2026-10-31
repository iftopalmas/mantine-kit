import { forwardRef } from 'react';

import { RouterAdapter, RouterLinkProps } from '../src/router/RouterAdapter';

/** Simulated router of the tests and the navigation function it calls. */
export type TestRouter = {
    router: RouterAdapter;

    /** Called with the destination URL on each navigation done by the code (not by the links). */
    navigate: jest.Mock<void, [string]>;
};

/** Link of the tests: a plain `<a>` that does not navigate, since jsdom does not implement navigation and would warn. */
const TestLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(({ onClick, ...props }, ref) => (
    <a
        ref={ref}
        onClick={event => {
            onClick?.(event);
            event.preventDefault();
        }}
        {...props}
    />
));
TestLink.displayName = 'TestLink';

/**
 * Creates a simulated router, which always stays on the same page and records the navigations.
 * @param pathname path of the current page
 */
export function createTestRouter(pathname: string = '/'): TestRouter {
    const navigate = jest.fn<void, [string]>();
    const router: RouterAdapter = { Link: TestLink, usePathname: () => pathname, useNavigate: () => navigate };

    return { router, navigate };
}
