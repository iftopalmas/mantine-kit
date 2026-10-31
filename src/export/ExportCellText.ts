import { DEFAULT_LOCALE } from '../i18n/KitLocale';
import { ClassifiedCell, NumberFormat } from './ExportDocument';

/** Multiplier that converts a percentage from the 0..1 scale to the 0..100 display scale. */
const PERCENT_SCALE = 100;

/**
 * Formatters already created, by locale and format. Creating an `Intl.NumberFormat` is expensive, and the export
 * formats every cell (e.g. to measure the column widths), but there are few combinations of locale, decimal places and
 * thousands separator.
 */
const formatters = new Map<string, Intl.NumberFormat>();

/**
 * Returns the number formatter of a locale for the given decimal places and thousands separator.
 * @param locale locale of the format
 * @param decimals decimal places
 * @param grouping whether the thousands separator is used
 * @return the formatter, created only the first time
 */
function numberFormatter(locale: string, decimals: number, grouping: boolean): Intl.NumberFormat {
    const key = `${locale}:${decimals}:${grouping}`;
    let formatter = formatters.get(key);
    if (!formatter) {
        formatter = new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            useGrouping: grouping
        });
        formatters.set(key, formatter);
    }

    return formatter;
}

/**
 * Formats a number as a spreadsheet in the language of the locale shows it (e.g. a decimal comma in `pt-BR`).
 * @param value number; a percentage is in the 0..1 scale
 * @param format decimal places and whether the value is a percentage
 * @param grouping whether the thousands separator is used (e.g. "1.234,56" in `pt-BR`); `false` gives "1234,56"
 * @param locale locale of the format; defaults to `en-US`
 * @return the formatted number, with "%" at the end if it is a percentage
 */
export function formatNumber(
    value: number,
    format: NumberFormat,
    grouping: boolean = true,
    locale: string = DEFAULT_LOCALE
): string {
    const formatter = numberFormatter(locale, format.decimals, grouping);

    return format.percent ? `${formatter.format(value * PERCENT_SCALE)}%` : formatter.format(value);
}

/**
 * Returns the text of a cell, as the user sees it.
 * @param cell cell already classified
 * @param grouping whether the numbers use the thousands separator
 * @param locale locale of the number format; defaults to `en-US`
 * @return the text of the cell; empty for an absent value
 */
export function cellText(cell: ClassifiedCell, grouping: boolean = true, locale: string = DEFAULT_LOCALE): string {
    switch (cell.kind) {
        case 'empty':
            return '';
        case 'number':
            return formatNumber(cell.value, cell.format, grouping, locale);
        default:
            return cell.text;
    }
}
