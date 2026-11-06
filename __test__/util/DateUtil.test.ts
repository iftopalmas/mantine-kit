import { describe, expect, test } from '@jest/globals';

import { formatDate, formatDateToISO, getCurrentYearMonth, parseDate, validDateInterval } from '@/src/util/DateUtil';

describe('parseDate', () => {
    // A day up to 12 is also a valid month: without the format, the day and the month would be swapped.
    test('reads the day and the month in the order of the given format', () => {
        expect(formatDateToISO(parseDate('05/10/2026', 'DD/MM/YYYY'))).toBe('2026-10-05');
        expect(formatDateToISO(parseDate('05/10/2026', 'MM/DD/YYYY'))).toBe('2026-05-10');
    });

    test('uses the DD/MM/YYYY format by default', () => {
        expect(formatDateToISO(parseDate('05/10/2026'))).toBe('2026-10-05');
    });

    test('returns null when there is no date', () => {
        expect(parseDate(undefined)).toBeNull();
        expect(parseDate('')).toBeNull();
    });

    test('returns a copy of a Date, whatever the format', () => {
        const date = new Date(2026, 9, 5);
        const parsed = parseDate(date, 'MM/DD/YYYY');

        expect(parsed).toEqual(date);
        expect(parsed).not.toBe(date);
    });

    test('reads the date at midnight in the local time zone', () => {
        expect(parseDate('05/10/2026')).toEqual(new Date(2026, 9, 5));
    });

    test('reads the years 0 to 99 as written', () => {
        expect(formatDateToISO(parseDate('05/10/0050'))).toBe('0050-10-05');
    });

    test('keeps the literals of the format', () => {
        expect(formatDateToISO(parseDate('2026.10.05', 'YYYY.MM.DD'))).toBe('2026-10-05');
        expect(parseDate('2026x10x05', 'YYYY.MM.DD')?.getTime()).toBeNaN();
    });

    // Mantine's DateInput gives ISO texts in onChange: DateField has always received them as an Invalid Date.
    test.each(['abc', '2026-10-05', '5/1/2026', '31/02/2026', '05/13/2026', '05/10/2026 extra'])(
        'returns an Invalid Date for %s',
        text => {
            expect(parseDate(text)?.getTime()).toBeNaN();
        }
    );

    test.each(['D/M/YYYY', 'DD MMM YYYY', 'DD/MM/YY', 'DD/MM', 'DD/DD/YYYY', 'DD/MM/YYYY HH:mm'])(
        'rejects the unsupported format %s',
        format => {
            expect(() => parseDate('05/10/2026', format)).toThrow('Unsupported date format');
        }
    );
});

describe('formatDate', () => {
    test('formats in the given locale, or en-US by default', () => {
        const date = new Date(2026, 9, 5);

        expect(formatDate(date, 'pt-BR')).toBe('05/10/2026');
        expect(formatDate(date, 'en-US')).toBe('10/05/2026');
        expect(formatDate(date)).toBe('10/05/2026');
    });

    test('returns null when there is no valid date', () => {
        expect(formatDate(null)).toBeNull();
        expect(formatDate(new Date(NaN))).toBeNull();
    });
});

describe('formatDateToISO', () => {
    test('uses the local date, which may differ from the UTC date of toISOString', () => {
        expect(formatDateToISO(new Date(2026, 9, 5, 0, 0))).toBe('2026-10-05');
        expect(formatDateToISO(new Date(2026, 9, 5, 23, 59))).toBe('2026-10-05');
    });

    test('returns null when there is no valid date', () => {
        expect(formatDateToISO(undefined)).toBeNull();
        expect(formatDateToISO(new Date(NaN))).toBeNull();
    });
});

describe('getCurrentYearMonth', () => {
    test('returns the local year and month as YYYY-MM', () => {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        expect(getCurrentYearMonth()).toBe(`${now.getFullYear()}-${month}`);
    });
});

describe('validDateInterval', () => {
    test('requires the end date to be after the start date, unless it is absent', () => {
        const start = new Date(2026, 0, 10);

        expect(validDateInterval(start, new Date(2026, 0, 11))).toBe(true);
        expect(validDateInterval(start, new Date(2026, 0, 9))).toBe(false);
        expect(validDateInterval(start, undefined)).toBe(true);
    });
});
