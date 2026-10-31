import { DEFAULT_LOCALE } from '../i18n/KitLocale';
import { ExportMessages } from '../i18n/KitMessages';
import { resolveMessages } from '../i18n/resolveMessages';
import { ExportDocument } from './ExportDocument';

/**
 * Returns the texts of an exported document: the ones of its locale, with the ones the document overrides.
 * @param document exported document
 * @return the texts shown in the file
 */
export function exportMessages(document: Pick<ExportDocument, 'locale' | 'messages'>): ExportMessages {
    return resolveMessages(document.locale, { export: document.messages }).export;
}

/**
 * Returns the locale of an exported document.
 * @param document exported document
 * @return the locale of the document, or the default one
 */
export function exportLocale(document: Pick<ExportDocument, 'locale'>): string {
    return document.locale ?? DEFAULT_LOCALE;
}
