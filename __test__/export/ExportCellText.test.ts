import { describe, expect, test } from '@jest/globals';

import { cellText, formatNumber } from '@/src/export/ExportCellText';

const INTEGER = { decimals: 0 };

describe('ExportCellText', () => {
    test('formats in the en-US format by default, with or without the thousands separator', () => {
        expect(formatNumber(1234.567, { decimals: 2 })).toBe('1,234.57');
        expect(formatNumber(1234.567, { decimals: 2 }, false)).toBe('1234.57');
        expect(formatNumber(1234, INTEGER)).toBe('1,234');
        expect(formatNumber(-1234.5, { decimals: 1 })).toBe('-1,234.5');
    });

    test('formats in the format of the given locale', () => {
        expect(formatNumber(1234.567, { decimals: 2 }, true, 'pt-BR')).toBe('1.234,57');
        expect(cellText({ kind: 'number', value: 0.5, format: { decimals: 1, percent: true } }, true, 'pt-BR')).toBe(
            '50,0%'
        );
    });

    test('shows the percentages in the 0..100 scale, with the sign', () => {
        expect(formatNumber(0.855, { decimals: 1, percent: true })).toBe('85.5%');
        expect(formatNumber(1, { decimals: 0, percent: true })).toBe('100%');
    });

    test('the text of an empty cell is empty, and not zero', () => {
        expect(cellText({ kind: 'empty' })).toBe('');
        expect(cellText({ kind: 'number', value: 0, format: INTEGER })).toBe('0');
        expect(cellText({ kind: 'invalid', text: 'Error' })).toBe('Error');
    });
});
