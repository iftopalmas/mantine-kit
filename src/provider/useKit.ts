import { useContext } from 'react';

import { KitMessages } from '../i18n/KitMessages';
import { RouterAdapter } from '../router/RouterAdapter';
import { KitConfig } from './KitConfig';
import { KitContext } from './KitContext';

/** @return the configuration of the app, given to the `KitProvider` */
export function useKitConfig(): KitConfig {
    return useContext(KitContext);
}

/** @return the router of the app, given to the `KitProvider` */
export function useKitRouter(): RouterAdapter {
    return useContext(KitContext).router;
}

/** @return the texts of the locale chosen in the `KitProvider` */
export function useKitMessages(): KitMessages {
    return useContext(KitContext).messages;
}

/**
 * Builds the browser tab title of a page: the page title followed by the app name, if any.
 * @param pageTitle title of the page
 * @return the title, such as "Regions - My System"
 */
export function useDocumentTitle(pageTitle: string): string {
    const { appName } = useKitConfig();

    return appName ? `${pageTitle} - ${appName}` : pageTitle;
}
