/**
 * Comparison functions used to sort lists and tables according to a locale.
 */

import { DEFAULT_LOCALE } from '../i18n/KitLocale';

/**
 * Text collators already created, by locale. Creating an `Intl.Collator` is much more expensive than using it.
 * Accented letters stay with the letter without accent and upper case letters with the lower case ones (e.g.
 * "Émile" before "emma", which comes before "Frank"). Numbers inside the text are compared by value (`numeric`), so
 * "District 2" comes before "District 10".
 */
const collators = new Map<string, Intl.Collator>();

/**
 * Returns the text collator of a locale, created only the first time.
 * @param locale locale of the comparison
 */
function collator(locale: string): Intl.Collator {
    let result = collators.get(locale);
    if (!result) {
        result = new Intl.Collator(locale, { numeric: true });
        collators.set(locale, result);
    }

    return result;
}

/**
 * Compares two texts according to a locale, to be used in `Array.prototype.sort`.
 * @param locale locale of the comparison; defaults to `en-US`
 * @return negative if `a` comes before `b`, positive if it comes after and 0 if they are equivalent
 */
export function compareText(a: string, b: string, locale: string = DEFAULT_LOCALE): number {
    return collator(locale).compare(a, b);
}

/** Tells whether a value is absent (`null` or `undefined`). */
export const isAbsent = (value: unknown): value is null | undefined => value === null || value === undefined;

/**
 * Compares two values of any type in ascending order, to be used in `Array.prototype.sort`: numbers and dates by
 * value, texts according to the locale and the other values by their text representation. Absent values
 * (`null`/`undefined`) always come last.
 * @param locale locale of the text comparison; defaults to `en-US`
 * @return negative if `a` comes before `b`, positive if it comes after and 0 if they are equivalent
 */
export function compareValues(a: unknown, b: unknown, locale: string = DEFAULT_LOCALE): number {
    if (isAbsent(a) || isAbsent(b)) return Number(isAbsent(a)) - Number(isAbsent(b));
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();

    return compareText(String(a), String(b), locale);
}
