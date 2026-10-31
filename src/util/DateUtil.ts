import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import type { DateValue } from '@mantine/dates';

/* Without this plugin, Day.js ignores the format given to `dayjs(value, format)` and parses the text month first. */
dayjs.extend(customParseFormat);

export const BR_DATE_FORMAT = 'DD/MM/YYYY';
export const ISO_DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Minimum value for a date to be considered valid when Zod coerces it. It is later than the date created by
 * `new Date(null)` (12/31/1969), which Zod's `coerce` produces when a date field is not filled and receives `null`.
 */
export const MIN_VALID_DATE = new Date('01/01/1970');

/**
 * Formats a date.
 * @param date date to format
 * @param format format, in Day.js tokens; defaults to {@link BR_DATE_FORMAT}
 * @return the formatted date, or `null` if there is no date
 */
export function formatDate(date: Date | undefined | null, format: string = BR_DATE_FORMAT): string | null {
    return date ? dayjs(date).format(format) : null;
}

/**
 * Formats a date in the ISO 8601 format.
 * @param date date to format
 * @see #ISO_DATE_FORMAT
 */
export function formatDateToISO(date: Date | undefined | null): string | null {
    return date ? dayjs(date).format(ISO_DATE_FORMAT) : null;
}

/**
 * Converts a date in the given format to a `Date` object.
 * @param dateValue date to convert
 * @param format format of the date, in Day.js tokens; defaults to {@link BR_DATE_FORMAT}
 * @return the date, or `null` if there is no date
 */
export function parseDate(dateValue: DateValue | string | undefined, format: string = BR_DATE_FORMAT): Date | null {
    return dateValue ? dayjs(dateValue, format).toDate() : null;
}

/** @return the current year and month in the `YYYY-MM` format */
export function getCurrentYearMonth(): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
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
