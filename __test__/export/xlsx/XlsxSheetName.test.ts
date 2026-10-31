import { describe, expect, test } from '@jest/globals';

import { MAX_SHEET_NAME_LENGTH, xlsxSheetNames } from '@/src/export/xlsx/XlsxSheetName';

describe('xlsxSheetNames', () => {
    test('replaces the characters Excel does not accept and removes the apostrophes at the ends', () => {
        expect(xlsxSheetNames(['Revenue/Expense [$]: total?', "'Sales'"])).toEqual([
            'Revenue-Expense -$-- total-',
            'Sales'
        ]);
    });

    test('cuts the name to the maximum length of Excel', () => {
        const [name] = xlsxSheetNames(['Reference values and investments of the plan']);
        expect(name).toHaveLength(MAX_SHEET_NAME_LENGTH);
    });

    test('numbers the repeated names, case insensitive, even after being cut', () => {
        const long = 'x'.repeat(40);
        expect(xlsxSheetNames(['Sales', 'sales', 'Sales'])).toEqual(['Sales', 'sales (2)', 'Sales (3)']);
        expect(xlsxSheetNames([long, long])[1]).toBe(`${'x'.repeat(MAX_SHEET_NAME_LENGTH - 4)} (2)`);
    });

    test('gives a name to a sheet without a name, in the given language', () => {
        expect(xlsxSheetNames(['', '  '])).toEqual(['Sheet 1', 'Sheet 2']);
        expect(xlsxSheetNames([''], position => `Aba ${position}`)).toEqual(['Aba 1']);
    });

    // ExcelJS throws an error (and the whole export fails) with an apostrophe at the end of the name.
    test('removes the apostrophe and the space the cut leaves at the end of the name', () => {
        const [withApostrophe, withSpace] = xlsxSheetNames([`${'a'.repeat(30)}'b`, `${'c'.repeat(30)} d`]);
        expect(withApostrophe).toBe('a'.repeat(30));
        expect(withSpace).toBe('c'.repeat(30));
    });

    test('does not use the reserved name "History"', () => {
        expect(xlsxSheetNames(['History', 'history'])).toEqual(['History (2)', 'history (3)']);
    });
});
