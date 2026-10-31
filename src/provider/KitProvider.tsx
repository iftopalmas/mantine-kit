import { PropsWithChildren, ReactElement, useMemo } from 'react';

import { KitOptions } from './KitConfig';
import { kitConfig, KitContext } from './KitContext';

/**
 * Gives the library components the configuration of the app: router, name, locale and texts. It must wrap the app,
 * inside the `MantineProvider`. Options not given use the defaults (see {@link kitConfig}).
 */
export function KitProvider({
    children,
    router,
    appName,
    locale,
    messages,
    formRouteSegments
}: PropsWithChildren<KitOptions>): ReactElement {
    const config = useMemo(
        () => kitConfig({ router, appName, locale, messages, formRouteSegments }),
        [router, appName, locale, messages, formRouteSegments]
    );

    return <KitContext.Provider value={config}>{children}</KitContext.Provider>;
}
