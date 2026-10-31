import { cellText } from '../ExportCellText';
import { ClassifiedCell, classifyCell, ExportDocument, ExportSheet } from '../ExportDocument';
import { ExportFormat } from '../ExportFormat';
import { DEFAULT_LOCALE } from '../../i18n/KitLocale';
import { exportLocale, exportMessages } from '../ExportTexts';

/**
 * Column separator used when the decimal separator of the locale is the comma (e.g. `pt-BR`), which is what Excel
 * expects in these languages.
 */
export const CSV_SEPARATOR = ';';

/** Column separator used when the decimal separator of the locale is not the comma (e.g. `en-US`). */
export const CSV_COMMA_SEPARATOR = ',';

/** Line break of the CSV ({@link https://www.rfc-editor.org/rfc/rfc4180 RFC 4180}). */
const LINE_BREAK = '\r\n';

/** UTF-8 byte order mark (BOM): without it, Excel opens the file with garbled accents. */
const UTF8_BOM = '﻿';

/**
 * Start of a text that Excel would read as a formula (`=`, `+`, `-`, `@`, tab or CR). A name typed by a user as
 * `=HYPERLINK(...)` would become a formula when the file is opened (CSV injection), so the text gets a leading
 * apostrophe.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * Returns the column separator of the CSV for a locale: `;` when the decimal separator is the comma, so numbers do not
 * clash with the separator, or `,` otherwise.
 * @param locale locale of the number format
 */
export function csvSeparator(locale: string): string {
    const decimal = new Intl.NumberFormat(locale).formatToParts(1.1).find(part => part.type === 'decimal')?.value;

    return decimal === ',' ? CSV_SEPARATOR : CSV_COMMA_SEPARATOR;
}

/**
 * Exports to CSV, as Excel in the language of the locale expects: the decimal separator of the locale, a column
 * separator that does not clash with it (see {@link csvSeparator}), no thousands separator and UTF-8 with BOM. The CSV
 * has only the table (header and rows), without the title or the context, so other programs can also read the
 * columns. Having no sheets, it accepts only documents with one sheet.
 *
 * The CSV is text, so each number has the decimal places of its format (the same as on the screen), rounded. The
 * `.xlsx` stores the full value and just shows it with these places.
 * @author Manoel Campos
 */
export class CsvFormat implements ExportFormat {
    readonly id = 'csv';
    readonly label = 'CSV';
    readonly extension = 'csv';
    readonly mimeType = 'text/csv;charset=utf-8';
    readonly multipleSheets = false;

    async generate(document: ExportDocument): Promise<Blob> {
        if (document.sheets.length !== 1) {
            throw new Error(`A CSV file has a single sheet, but the document has ${document.sheets.length}.`);
        }

        const text = csvText(document.sheets[0], exportLocale(document), exportMessages(document).invalidCell);
        return new Blob([UTF8_BOM + text], { type: this.mimeType });
    }
}

/**
 * Builds the CSV text of a sheet.
 * @param sheet columns and rows of the table
 * @param locale locale of the number format, which also defines the column separator; defaults to `en-US`
 * @param invalidText text of an infinite number
 * @return the header and the rows, each one ended by a line break
 */
export function csvText(sheet: ExportSheet, locale: string = DEFAULT_LOCALE, invalidText?: string): string {
    const separator = csvSeparator(locale);
    const field = (text: string) => csvField(text, separator);
    const header = sheet.columns.map(column => field(column.header));
    const rows = sheet.rows.map(row =>
        sheet.columns.map((column, i) => csvCell(classifyCell(row[i], column.format, invalidText), locale, field))
    );

    return [header, ...rows].map(fields => fields.join(separator) + LINE_BREAK).join('');
}

/**
 * Converts a cell to the CSV field. Numbers have the decimal separator of the locale and no thousands separator, which
 * Excel in that language reads as a number (and a percentage, such as "85,5%", as 0.855). Texts, including the one of
 * an invalid cell, go through the text field function.
 * @param cell cell already classified
 * @param locale locale of the number format
 * @param field function that prepares a text field
 * @return the CSV field
 */
function csvCell(cell: ClassifiedCell, locale: string, field: (text: string) => string): string {
    const text = cellText(cell, false, locale);

    return cell.kind === 'number' ? text : field(text);
}

/**
 * Prepares a text for the CSV: prevents it from becoming a formula and quotes it if needed.
 * @param text text of the field
 * @param separator column separator, which requires quotes when present in the text
 * @return the CSV field
 */
function csvField(text: string, separator: string): string {
    const safeText = FORMULA_START.test(text) ? `'${text}` : text;
    const needsQuotes = safeText.includes(separator) || /["\r\n]/.test(safeText);

    return needsQuotes ? `"${safeText.replaceAll('"', '""')}"` : safeText;
}
