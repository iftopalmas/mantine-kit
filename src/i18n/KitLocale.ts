/** American English locale. */
export const LOCALE_EN_US = 'en-US';

/** Brazilian Portuguese locale. */
export const LOCALE_PT_BR = 'pt-BR';

/** Locales with a built-in message catalog. */
export type KitLocale = typeof LOCALE_PT_BR | typeof LOCALE_EN_US;

/** Locale used when the app does not choose one. */
export const DEFAULT_LOCALE: KitLocale = LOCALE_EN_US;
