/**
 * @jest-environment node
 */
import { describe, expect, jest, test } from '@jest/globals';

import { EXPORT_FORMATS } from '@/src/export/ExportFormats';
import { exportDocument, SHEET } from '@/__test__/export/ExportFixture';

/* The first file generated in a test run loads ExcelJS, which is big: with all test files running in parallel, it can
   take longer than the default timeout of 5 s. */
jest.setTimeout(30_000);

/**
 * Checks that every registered format fulfills the `ExportFormat` contract. A new format enters these tests just by
 * being registered in `EXPORT_FORMATS`.
 */
describe.each(EXPORT_FORMATS.map(format => ({ id: format.id, format })))('format $id', ({ format }) => {
    test('generates a non-empty file, with the MIME type of the format', async () => {
        const blob = await format.generate(exportDocument());
        expect(blob.type).toBe(format.mimeType);
        expect(blob.size).toBeGreaterThan(0);
    });

    test('accepts many sheets or rejects the document with many sheets', async () => {
        const result = format.generate(exportDocument([SHEET, SHEET]));
        await (format.multipleSheets ? expect(result).resolves.toBeInstanceOf(Blob) : expect(result).rejects.toThrow());
    });

    test('rejects a document without sheets', async () => {
        await expect(format.generate(exportDocument([]))).rejects.toThrow();
    });

    test('has the extension without the dot', () => {
        expect(format.extension).toMatch(/^[a-z0-9]+$/);
    });
});

describe('EXPORT_FORMATS', () => {
    test('repeats no id nor extension', () => {
        expect(new Set(EXPORT_FORMATS.map(format => format.id)).size).toBe(EXPORT_FORMATS.length);
        expect(new Set(EXPORT_FORMATS.map(format => format.extension)).size).toBe(EXPORT_FORMATS.length);
    });
});
