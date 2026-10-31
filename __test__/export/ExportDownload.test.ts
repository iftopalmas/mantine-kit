import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';

import { downloadExport } from '@/src/export/ExportDownload';
import { ExportFormat } from '@/src/export/ExportFormat';
import { exportDocument } from '@/__test__/export/ExportFixture';

/** Fake format, which generates no real file: the test is only about the download. */
const FORMAT: ExportFormat = {
    id: 'xlsx',
    label: 'Fake',
    extension: 'txt',
    mimeType: 'text/plain',
    multipleSheets: true,
    generate: () => Promise.resolve(new Blob(['content'], { type: 'text/plain' }))
};

describe('downloadExport', () => {
    /* jsdom implements neither object URLs nor the navigation of a click on a link. */
    beforeEach(() => {
        URL.createObjectURL = jest.fn(() => 'blob:file');
        URL.revokeObjectURL = jest.fn();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    test('downloads the file with the base name, the generation date and the extension of the format', async () => {
        const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
            this: HTMLAnchorElement
        ) {
            expect(this.download).toBe('sales-report-2026-10-20.txt');
            expect(this.href).toBe('blob:file');
        });

        await downloadExport(exportDocument(), FORMAT);

        expect(click).toHaveBeenCalledTimes(1);
        expect(document.querySelector('a')).toBeNull();
    });

    test('uses the default file name of the locale of the document when the name has no valid character', async () => {
        const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
            this: HTMLAnchorElement
        ) {
            expect(this.download).toBe('dados-2026-10-20.txt');
        });

        await downloadExport({ ...exportDocument(), fileName: ' / ', locale: 'pt-BR' }, FORMAT);

        expect(click).toHaveBeenCalledTimes(1);
    });

    /* Releasing the URL right after the click makes some browsers cancel the download, which starts later. */
    test('releases the URL of the file only after the download starts', async () => {
        jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        await downloadExport(exportDocument(), FORMAT);
        expect(URL.revokeObjectURL).not.toHaveBeenCalled();

        jest.runAllTimers();
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:file');
    });
});
