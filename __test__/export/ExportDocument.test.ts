import { describe, expect, test } from '@jest/globals';

import { classifyCell, DEFAULT_NUMBER_FORMAT, invalidCell, isInvalidCell } from '@/src/export/ExportDocument';
import { enUS } from '@/src/i18n/messages/enUS';

const INTEGER = { decimals: 0 };

describe('classifyCell', () => {
    test('tells zero, absent value and invalid result apart', () => {
        expect(classifyCell(0)).toEqual({ kind: 'number', value: 0, format: DEFAULT_NUMBER_FORMAT });
        expect(classifyCell(undefined)).toEqual({ kind: 'empty' });
        expect(classifyCell(invalidCell())).toEqual({ kind: 'invalid', text: enUS.export.invalidCell });
    });

    test('treats NaN as absent and Infinity as invalid, with the given text', () => {
        expect(classifyCell(Number.NaN)).toEqual({ kind: 'empty' });
        expect(classifyCell({ value: Number.NaN, format: INTEGER })).toEqual({ kind: 'empty' });
        expect(classifyCell(Number.POSITIVE_INFINITY).kind).toBe('invalid');
        expect(classifyCell(Number.NEGATIVE_INFINITY, INTEGER, 'Error')).toEqual({ kind: 'invalid', text: 'Error' });
    });

    test('uses the format of the column, unless the cell has its own', () => {
        const percentage = { decimals: 1, percent: true };
        expect(classifyCell(5, INTEGER)).toEqual({ kind: 'number', value: 5, format: INTEGER });
        expect(classifyCell({ value: 0.5, format: percentage }, INTEGER)).toEqual({
            kind: 'number',
            value: 0.5,
            format: percentage
        });
    });

    test('keeps the text and the text of an invalid cell', () => {
        expect(classifyCell('Water')).toEqual({ kind: 'text', text: 'Water' });
        expect(classifyCell(invalidCell('#DIV/0'))).toEqual({ kind: 'invalid', text: '#DIV/0' });
        expect(isInvalidCell(invalidCell())).toBe(true);
        expect(isInvalidCell({ value: 1, format: INTEGER })).toBe(false);
    });
});
