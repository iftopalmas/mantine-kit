import { describe, expect, test } from '@jest/globals';

import { xlsxNumberFormat } from '@/src/export/xlsx/XlsxNumberFormat';

describe('xlsxNumberFormat', () => {
    test('builds the Excel format code', () => {
        expect(xlsxNumberFormat({ decimals: 0 })).toBe('#,##0');
        expect(xlsxNumberFormat({ decimals: 2 })).toBe('#,##0.00');
        expect(xlsxNumberFormat({ decimals: 1, percent: true })).toBe('0.0%');
        expect(xlsxNumberFormat({ decimals: 0, percent: true })).toBe('0%');
    });
});
