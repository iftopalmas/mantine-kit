import { describe, expect, test } from '@jest/globals';

import { formatDate, formatDateToISO, parseDate, validDateInterval } from '@/src/util/DateUtil';

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
});

describe('formatDate', () => {
    test('formats in the given format, or DD/MM/YYYY by default', () => {
        const date = new Date(2026, 9, 5);

        expect(formatDate(date)).toBe('05/10/2026');
        expect(formatDate(date, 'MM/DD/YYYY')).toBe('10/05/2026');
        expect(formatDate(null)).toBeNull();
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
