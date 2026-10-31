import { DEFAULT_LOCALE, KitLocale } from './KitLocale';
import { KitMessages, KitMessagesOverride } from './KitMessages';
import { enUS } from './messages/enUS';
import { ptBR } from './messages/ptBR';

/** Built-in message catalog of each locale. */
export const KIT_MESSAGES: Readonly<Record<KitLocale, KitMessages>> = { 'pt-BR': ptBR, 'en-US': enUS };

/** Texts of the {@link DEFAULT_LOCALE}, used as defaults by the code outside React. */
export const DEFAULT_MESSAGES: KitMessages = KIT_MESSAGES[DEFAULT_LOCALE];

/**
 * Returns the texts of a locale, with the texts the app overrides.
 * @param locale locale of the texts; defaults to {@link DEFAULT_LOCALE}
 * @param override texts that replace the ones of the locale, by section
 * @return the texts, with every section complete
 */
export function resolveMessages(locale: KitLocale = DEFAULT_LOCALE, override: KitMessagesOverride = {}): KitMessages {
    const base = KIT_MESSAGES[locale];
    const sections = Object.keys(base) as (keyof KitMessages)[];

    return Object.fromEntries(
        sections.map(section => [section, { ...base[section], ...override[section] }])
    ) as KitMessages;
}
