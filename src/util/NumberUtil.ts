import { DEFAULT_LOCALE } from '../i18n/KitLocale';

/**
 * Returns the fractional part of a number.
 * @param value number to get the fractional part from
 */
function getDecimalPlaces(value: number): number {
    return value - Number(value.toFixed(0));
}

/**
 * Checks whether a number has no fractional part.
 * @param value number to check
 */
function hasNoDecimalPlaces(value: number): boolean {
    return getDecimalPlaces(value) === 0;
}

/**
 * Formats a number according to a locale, with a fixed number of decimal places.
 * @param number number to format
 * @param minimumFractionDigits decimal places shown (the number is rounded to them)
 * @param locale locale of the format; defaults to `en-US`
 * @return the formatted number, such as "1.234,56" in `pt-BR` or "1,234.56" in `en-US`
 */
function numberFormat(number: number, minimumFractionDigits: number = 2, locale: string = DEFAULT_LOCALE): string {
    const formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits,
        maximumFractionDigits: minimumFractionDigits
    });
    return formatter.format(number);
}

export { getDecimalPlaces, hasNoDecimalPlaces, numberFormat };
