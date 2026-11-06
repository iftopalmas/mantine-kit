import { DEFAULT_LOCALE, KitLocale } from '../i18n/KitLocale';

/** Value of a date field: a `Date`, a text in the given format, or nothing. */
export type DateFieldValue = Date | string | null | undefined;

export const BR_DATE_FORMAT = 'DD/MM/YYYY';
export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

/** Tokens of the formats {@link parseDate} reads, with the part of the date each one captures. */
const DATE_TOKEN_PATTERNS: Readonly<Record<string, string>> = {
    YYYY: '(?<year>\\d{4})',
    MM: '(?<month>\\d{2})',
    DD: '(?<day>\\d{2})'
};

const DATE_TOKEN = /YYYY|MM|DD/g;

/** Length of the `YYYY-MM` prefix of an ISO date. */
const YEAR_MONTH_LENGTH = 7;

/**
 * Minimum value for a date to be considered valid when Zod coerces it. It is later than the date created by
 * `new Date(null)` (12/31/1969), which Zod's `coerce` produces when a date field is not filled and receives `null`.
 */
export const MIN_VALID_DATE = new Date('01/01/1970');

/** @return whether there is a date and it is valid: `Intl` throws an error for an Invalid Date */
function isValidDate(date: Date | undefined | null): date is Date {
    return !!date && !Number.isNaN(date.getTime());
}

/**
 * Formats a date in the numeric format of the locale, with 2-digit day and month (e.g. `10/05/2026` in `en-US`).
 * @param date a valid date, shown in the time zone of the runtime
 * @param locale locale that defines the order of the fields
 */
export function formatLocaleDate(date: Date, locale: KitLocale): string {
    return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Formats a time, without seconds, in the format of the locale (e.g. `2:30 PM` in `en-US`, `14:30` in `pt-BR`).
 * @param date a valid date, shown in the time zone of the runtime
 * @param locale locale that defines the 12 or 24-hour clock
 */
export function formatLocaleTime(date: Date, locale: KitLocale): string {
    return date.toLocaleTimeString(locale, { timeStyle: 'short' });
}

/**
 * Formats a date in the numeric format of the locale.
 * @param date date to format
 * @param locale locale of the format; defaults to {@link DEFAULT_LOCALE}
 * @return the formatted date, or `null` if there is no valid date
 */
export function formatDate(date: Date | undefined | null, locale: KitLocale = DEFAULT_LOCALE): string | null {
    return isValidDate(date) ? formatLocaleDate(date, locale) : null;
}

/** @return the date in the {@link ISO_DATE_FORMAT}, in the time zone of the runtime */
function toLocalIsoText(date: Date): string {
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Formats a date in the ISO 8601 format, in the time zone of the runtime.
 * @param date date to format
 * @return the formatted date, or `null` if there is no valid date
 * @see #ISO_DATE_FORMAT
 */
export function formatDateToISO(date: Date | undefined | null): string | null {
    return isValidDate(date) ? toLocalIsoText(date) : null;
}

/**
 * Creates the regular expression that reads a date in the given format.
 * @param format format with the tokens `DD`, `MM` and `YYYY`, once each, and no other letters
 * @throws Error if the format has anything else, such as the `MMM` or `YY` tokens of Mantine's `valueFormat`
 */
function dateFormatRegex(format: string): RegExp {
    const tokens = format.match(DATE_TOKEN) ?? [];
    const onlyKnownTokens = !/[a-z]/i.test(format.replace(DATE_TOKEN, ''));
    if (tokens.length !== 3 || new Set(tokens).size !== 3 || !onlyKnownTokens) {
        throw new Error(`Unsupported date format: ${format}. Use DD, MM and YYYY.`);
    }

    const literalsEscaped = format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${literalsEscaped.replace(DATE_TOKEN, token => DATE_TOKEN_PATTERNS[token])}$`);
}

/**
 * Converts the text of a date to a `Date` at midnight in the time zone of the runtime.
 * @return the date, or an Invalid Date if the text is not in the format or is not a date of the calendar (e.g. 02/31)
 */
function parseDateText(text: string, format: string): Date {
    const parts = dateFormatRegex(format).exec(text)?.groups;
    if (!parts) return new Date(NaN);

    const [year, month, day] = [Number(parts.year), Number(parts.month), Number(parts.day)];

    // setFullYear, since the Date constructor reads the years 0 to 99 as 1900 to 1999.
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(0, 0, 0, 0);

    // Date moves a day missing from the calendar (e.g. 02/31) to the next month, which changes the fields.
    const isSameDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    return isSameDate ? date : new Date(NaN);
}

/**
 * Converts a date in the given format to a `Date` object.
 * @param dateValue date to convert
 * @param format format of a text date, with the tokens `DD`, `MM` and `YYYY`; defaults to {@link BR_DATE_FORMAT}
 * @return the date, `null` if there is no date, or an Invalid Date if the text is not a date in the format
 * @throws Error if a text date is given with an unsupported format
 */
export function parseDate(dateValue: DateFieldValue, format: string = BR_DATE_FORMAT): Date | null {
    if (!dateValue) return null;

    return dateValue instanceof Date ? new Date(dateValue) : parseDateText(dateValue, format);
}

/** @return the current year and month in the `YYYY-MM` format */
export function getCurrentYearMonth(): string {
    return toLocalIsoText(new Date()).slice(0, YEAR_MONTH_LENGTH);
}

/**
 * Checks whether the end date is after the start date.
 * @param startDate start of the interval
 * @param endDate end of the interval; an absent or empty (before {@link MIN_VALID_DATE}) end date is valid
 * @return `true` if the interval is valid
 */
export function validDateInterval(startDate: Date, endDate: Date | undefined): boolean {
    return !endDate || endDate <= MIN_VALID_DATE || endDate > startDate;
}
