import { createContext } from 'react';

import { DEFAULT_LOCALE } from '../i18n/KitLocale';
import { resolveMessages } from '../i18n/resolveMessages';
import { anchorRouter } from '../router/anchorRouter';
import { DEFAULT_FORM_ROUTE_SEGMENTS } from '../router/FormRouteSegments';
import { KitConfig, KitOptions } from './KitConfig';

/**
 * Applies the defaults to the options of an app.
 * @param options options given to the `KitProvider`
 * @return the complete configuration
 */
export function kitConfig(options: KitOptions = {}): KitConfig {
    const locale = options.locale ?? DEFAULT_LOCALE;

    return {
        router: options.router ?? anchorRouter,
        appName: options.appName,
        locale,
        messages: resolveMessages(locale, options.messages),
        formRouteSegments: options.formRouteSegments ?? DEFAULT_FORM_ROUTE_SEGMENTS
    };
}

/** Context with the {@link KitConfig} of the app, read by the library components. Outside a provider, the defaults apply. */
export const KitContext = createContext<KitConfig>(kitConfig());
