import type { Workbook } from 'exceljs';

import { ExportDocument } from '../ExportDocument';
import { ExportFormat } from '../ExportFormat';
import { exportMessages } from '../ExportTexts';
import { XlsxSheetWriter } from './XlsxSheetWriter';
import { xlsxSheetNames } from './XlsxSheetName';
import { XlsxColors, xlsxStyles, XlsxStyles } from './XlsxStyle';

type ExcelJsModule = typeof import('exceljs');

/** Options of an {@link XlsxFormat}. */
export type XlsxFormatOptions = {
    /** Colors of the file (e.g. the brand colors of the app); the ones not given use the defaults. */
    colors?: Partial<XlsxColors>;
};

/**
 * Exports to Excel (`.xlsx`) with [ExcelJS](https://github.com/exceljs/exceljs): a sheet in the file for each sheet
 * of the document, with styles, the logo and the numbers in a numeric format (not text).
 *
 * ExcelJS is loaded on demand (dynamic `import()`), like ECharts: imported statically, it would be in the bundle of
 * every page that can export, even if the user exports nothing.
 * @author Manoel Campos
 */
export class XlsxFormat implements ExportFormat {
    readonly id = 'xlsx';
    readonly label = 'Excel (.xlsx)';
    readonly extension = 'xlsx';
    readonly mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    readonly multipleSheets = true;

    private readonly styles: XlsxStyles;

    /** @param options options of the format, such as the colors of the file */
    constructor(options: XlsxFormatOptions = {}) {
        this.styles = xlsxStyles(options.colors);
    }

    async generate(document: ExportDocument): Promise<Blob> {
        const workbook = await this.buildWorkbook(document);
        const buffer = await workbook.xlsx.writeBuffer();

        return new Blob([buffer], { type: this.mimeType });
    }

    /**
     * Builds the workbook with a sheet for each sheet of the document.
     * @param document data to export
     * @return the workbook ready to be written
     * @throws Error if the document has no sheets
     */
    async buildWorkbook(document: ExportDocument): Promise<Workbook> {
        // Excel does not open a file without any sheet.
        if (document.sheets.length === 0) throw new Error('There is no data to export.');

        const excelJs = await loadExcelJs();
        const workbook = new excelJs.Workbook();
        workbook.creator = document.branding.systemName;
        workbook.title = document.title;
        workbook.created = document.generatedAt;

        const logo = document.branding.logo;
        const logoImageId = logo ? workbook.addImage({ base64: logo.pngDataUrl, extension: 'png' }) : undefined;
        const defaultName = exportMessages(document).defaultSheetName;
        const names = xlsxSheetNames(
            document.sheets.map(sheet => sheet.name),
            defaultName
        );
        document.sheets.forEach((sheet, i) => {
            new XlsxSheetWriter(workbook.addWorksheet(names[i]), document, this.styles).write(sheet, logoImageId);
        });

        return workbook;
    }
}

/**
 * Loads ExcelJS. Being a CommonJS module, depending on the bundler the classes come in the module itself or in
 * `default`.
 * @return the ExcelJS module
 */
async function loadExcelJs(): Promise<ExcelJsModule> {
    const excelJs: ExcelJsModule & { default?: ExcelJsModule } = await import('exceljs');

    return excelJs.default ?? excelJs;
}
