/**
 * @jest-environment node
 */
import { describe, expect, test } from '@jest/globals';

import { csvSeparator, csvText } from '@/src/export/csv/CsvFormat';
import { ExportSheet, invalidCell } from '@/src/export/ExportDocument';
import { CSV_FORMAT } from '@/src/export/ExportFormats';
import { exportDocument, SHEET } from '@/__test__/export/ExportFixture';

/* Runs in the Node environment, which has `Blob.text()`, to read the generated file. */

describe('CsvFormat', () => {
    test('in en-US (the default), uses , between the columns and a decimal point', () => {
        expect(csvText(SHEET)).toBe(
            'Product name,Quantity,2026\r\n' + 'Water,1234,85.5%\r\n' + 'Sewage,0,\r\n' + 'Waste,,Error\r\n'
        );
    });

    test('in pt-BR, uses ; between the columns, a decimal comma and no thousands separator', () => {
        expect(csvText(SHEET, 'pt-BR')).toBe(
            'Product name;Quantity;2026\r\n' + 'Water;1234;85,5%\r\n' + 'Sewage;0;\r\n' + 'Waste;;Error\r\n'
        );
    });

    test('chooses the separator that does not clash with the decimal separator of the locale', () => {
        expect(csvSeparator('pt-BR')).toBe(';');
        expect(csvSeparator('de-DE')).toBe(';');
        expect(csvSeparator('en-US')).toBe(',');
    });

    test('starts with the UTF-8 BOM, so Excel reads the accents', async () => {
        const blob = await CSV_FORMAT.generate(exportDocument());
        const bytes = new Uint8Array(await blob.arrayBuffer());
        expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
        expect((await blob.text()).replace('﻿', '')).toBe(csvText(SHEET));
    });

    test('uses the locale of the document', async () => {
        const blob = await CSV_FORMAT.generate({ ...exportDocument(), locale: 'en-US' });
        expect((await blob.text()).replace('﻿', '')).toBe(csvText(SHEET, 'en-US', 'Error'));
    });

    test('quotes a text with the separator, quotes or a line break', () => {
        const sheet: ExportSheet = { name: 'A', columns: [{ header: 'Full; name' }], rows: [['Says "hi"\nend']] };
        expect(csvText(sheet, 'pt-BR')).toBe('"Full; name"\r\n"Says ""hi""\nend"\r\n');
        expect(csvText({ ...sheet, columns: [{ header: 'Full, name' }] })).toBe(
            '"Full, name"\r\n"Says ""hi""\nend"\r\n'
        );
    });

    test('prevents a text from becoming a formula in Excel, but keeps the negative numbers', () => {
        const sheet: ExportSheet = {
            name: 'A',
            columns: [{ header: 'Text' }, { header: 'Value' }],
            rows: [['=HYPERLINK("x")', -1.5]]
        };
        expect(csvText(sheet, 'pt-BR')).toBe('Text;Value\r\n"\'=HYPERLINK(""x"")";-1,50\r\n');
    });

    test('rejects a document with more than one sheet', async () => {
        await expect(CSV_FORMAT.generate(exportDocument([SHEET, SHEET]))).rejects.toThrow('single sheet');
    });

    test.each(['=1+1', '+1', '-text', '@SUM(A1)', '\tTAB', '\rCR'])(
        'prevents the text %j from becoming a formula, including in the header',
        text => {
            const sheet: ExportSheet = { name: 'A', columns: [{ header: text }], rows: [[text]] };
            const [header, row] = csvText(sheet).split('\r\n');
            expect(header.replace(/^"/, '').startsWith("'")).toBe(true);
            expect(row.replace(/^"/, '').startsWith("'")).toBe(true);
        }
    );

    test('treats the text of an invalid cell as text, and keeps the sign of a negative percentage', () => {
        const sheet: ExportSheet = {
            name: 'A',
            columns: [{ header: 'Error' }, { header: 'Change', format: { decimals: 1, percent: true } }],
            rows: [[invalidCell('=ERROR;x'), -0.125]]
        };
        expect(csvText(sheet, 'pt-BR')).toBe('Error;Change\r\n"\'=ERROR;x";-12,5%\r\n');
    });
});
