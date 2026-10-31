import { KitLocale } from '../i18n/KitLocale';
import { KitMessages, KitMessagesOverride } from '../i18n/KitMessages';
import { FormRouteSegments } from '../router/FormRouteSegments';
import { RouterAdapter } from '../router/RouterAdapter';

/** Options an app gives to the `KitProvider`. All of them are optional. */
export type KitOptions = {
    /** Router of the app; without it, links reload the page (see `anchorRouter`). */
    router?: RouterAdapter;

    /** Name of the app, shown in the browser tab title by the page templates (e.g. "Regions - My System"). */
    appName?: string;

    /** Locale of the texts and of the number and date formats. Default: `en-US`. */
    locale?: KitLocale;

    /** Texts that replace the ones of the locale (e.g. translations from the i18n library of the app). */
    messages?: KitMessagesOverride;

    /** URL segments of the CRUD form pages (create, edit and view). */
    formRouteSegments?: FormRouteSegments;
};

/** Configuration the components read from the `KitProvider`: the {@link KitOptions} with the defaults applied. */
export type KitConfig = {
    router: RouterAdapter;
    appName?: string;
    locale: KitLocale;

    /** Texts of the locale, with the ones the app overrides. */
    messages: KitMessages;
    formRouteSegments: FormRouteSegments;
};
