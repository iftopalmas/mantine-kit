import type { Cell, Row, Worksheet } from 'exceljs';

import { ExportMessages } from '../../i18n/KitMessages';
import { cellText } from '../ExportCellText';
import { ClassifiedCell, classifyCell, ExportDocument, ExportSheet } from '../ExportDocument';
import { exportLocale, exportMessages } from '../ExportTexts';
import { xlsxNumberFormat } from './XlsxNumberFormat';
import {
    COLUMN_PADDING,
    LOGO_HEIGHT,
    LOGO_ROWS,
    MAX_COLUMN_WIDTH,
    MIN_COLUMN_WIDTH,
    xlsxStyles,
    XlsxStyles
} from './XlsxStyle';

/**
 * Writes a sheet of the `.xlsx`, from top to bottom: the logo, the title, the generation date, the context info, the
 * table and the footer with the link of the system. Numbers are numeric (not text), with the format of each cell.
 * @author Manoel Campos
 */
export class XlsxSheetWriter {
    private readonly worksheet: Worksheet;
    private readonly document: ExportDocument;
    private readonly messages: ExportMessages;
    private readonly styles: XlsxStyles;

    /** Next free row of the sheet (starts at 1, as in Excel). */
    private nextRow = 1;

    /**
     * @param worksheet sheet to write to
     * @param document exported document, where the title, the context, the texts and the visual identity come from
     * @param styles fonts, fills and borders of the sheet
     */
    constructor(worksheet: Worksheet, document: ExportDocument, styles: XlsxStyles = xlsxStyles()) {
        this.worksheet = worksheet;
        this.document = document;
        this.messages = exportMessages(document);
        this.styles = styles;
    }

    /**
     * Writes the whole sheet.
     * @param sheet columns and rows of the table
     * @param logoImageId id of the logo registered in the workbook; absent to show no logo
     */
    write(sheet: ExportSheet, logoImageId?: number): void {
        this.writeHeader(logoImageId);
        const rows = classifyRows(sheet, this.messages.invalidCell);
        const headerRow = this.writeTable(sheet, rows);
        this.writeFooter();
        this.adjustColumnWidths(sheet, rows);
        this.setupPrinting(headerRow);
    }

    /**
     * Writes the logo, the title, the generation date and the context info.
     * @param logoImageId id of the logo registered in the workbook
     */
    private writeHeader(logoImageId?: number): void {
        const { logo } = this.document.branding;
        if (logoImageId !== undefined && logo) {
            const width = Math.round((LOGO_HEIGHT * logo.width) / logo.height);
            this.worksheet.addImage(logoImageId, { tl: { col: 0, row: 0 }, ext: { width, height: LOGO_HEIGHT } });
            this.nextRow += LOGO_ROWS;
        }

        this.addRow([this.document.title]).getCell(1).font = this.styles.titleFont;
        this.addRow([this.messages.generatedAt(this.document.generatedAt)]).getCell(1).font = this.styles.subtitleFont;
        /* The label and the value stay in a single cell (as rich text, with the label in bold): the text flows to the
           empty cells beside it, instead of being cut by the width of the first column, which fits the table. */
        this.document.info.forEach(info => {
            this.addRow([]).getCell(1).value = {
                richText: [{ font: this.styles.infoLabelFont, text: `${info.label}: ` }, { text: info.value }]
            };
        });
        this.nextRow++;
    }

    /**
     * Writes the table: the header and the rows, with borders, zebra stripes and the Excel filter in the header.
     * @param sheet columns of the table
     * @param rows cells of each row, already classified
     * @return the number of the header row
     */
    private writeTable(sheet: ExportSheet, rows: ClassifiedCell[][]): number {
        const headerRow = this.nextRow;
        this.addRow(sheet.columns.map(column => column.header)).eachCell(cell => {
            cell.font = this.styles.headerFont;
            cell.fill = this.styles.headerFill;
            cell.border = this.styles.cellBorder;
            cell.alignment = { vertical: 'middle', wrapText: true };
        });

        rows.forEach((row, i) => this.writeTableRow(row, i));
        if (rows.length > 0 && sheet.columns.length > 0) {
            this.worksheet.autoFilter = {
                from: { row: headerRow, column: 1 },
                to: { row: headerRow + rows.length, column: sheet.columns.length }
            };
        }

        return headerRow;
    }

    /**
     * Writes a row of the table.
     * @param row cells of the row, already classified
     * @param index position of the row in the table (0 for the first one), used in the zebra stripes
     */
    private writeTableRow(row: ClassifiedCell[], index: number): void {
        const excelRow = this.worksheet.getRow(this.nextRow++);
        row.forEach((classified, i) => {
            const cell = excelRow.getCell(i + 1);
            writeCell(cell, classified, this.styles);
            cell.border = this.styles.cellBorder;
            if (index % 2 === 1) cell.fill = this.styles.zebraFill;
        });
    }

    /** Writes the footer, with the name of the system and the link to it. */
    private writeFooter(): void {
        const { branding } = this.document;
        this.nextRow++;
        this.addRow([this.messages.footer(branding.systemName)]).getCell(1).font = this.styles.footerFont;

        const link = this.addRow([]).getCell(1);
        link.value = { text: branding.siteUrl, hyperlink: branding.siteUrl };
        link.font = this.styles.linkFont;
    }

    /**
     * Fits the width of each column to the longest text of the table. The rows outside the table (title, info and
     * footer) do not count, since their text can flow to the empty cells beside them.
     * @param sheet columns of the table
     * @param rows cells of each row, already classified
     */
    private adjustColumnWidths(sheet: ExportSheet, rows: ClassifiedCell[][]): void {
        const locale = exportLocale(this.document);
        sheet.columns.forEach((column, i) => {
            // reduce, not Math.max(...): the spread passes a row per argument and overflows the stack in a big sheet.
            const maxLength = rows.reduce(
                (max, row) => Math.max(max, cellText(row[i], true, locale).length),
                column.header.length
            );
            this.worksheet.getColumn(i + 1).width = Math.min(
                MAX_COLUMN_WIDTH,
                Math.max(MIN_COLUMN_WIDTH, maxLength + COLUMN_PADDING)
            );
        });
    }

    /**
     * Sets up printing: landscape, the table fitting the page width, the header repeated on every page and a page
     * footer with the system and the page number.
     * @param headerRow number of the header row
     */
    private setupPrinting(headerRow: number): void {
        this.worksheet.pageSetup = {
            ...this.worksheet.pageSetup,
            orientation: 'landscape',
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            printTitlesRow: `${headerRow}:${headerRow}`
        };

        // In the Excel page footer, `&` starts a code (e.g. &P is the page number), so it is escaped.
        const { branding } = this.document;
        const footer = `${this.messages.footer(branding.systemName)} - ${branding.siteUrl}`.replaceAll('&', '&&');
        this.worksheet.headerFooter.oddFooter = `&L${footer}&R${this.messages.excelPageNumber}`;
        this.worksheet.views = [{ showGridLines: false }];
    }

    /**
     * Adds a row at the next free position.
     * @param values values of the cells, from the first column on
     * @return the created row
     */
    private addRow(values: string[]): Row {
        const row = this.worksheet.getRow(this.nextRow++);
        values.forEach((value, i) => {
            row.getCell(i + 1).value = value;
        });

        return row;
    }
}

/**
 * Classifies the cells of all rows of the table, completing with empty cells the rows shorter than the number of
 * columns.
 * @param sheet columns and rows of the table
 * @param invalidText text of an infinite number
 * @return a classified cell per column, in each row
 * @throws Error if a row has more cells than columns, since the extra data would be lost without warning
 */
function classifyRows(sheet: ExportSheet, invalidText: string): ClassifiedCell[][] {
    return sheet.rows.map((row, rowIndex) => {
        if (row.length > sheet.columns.length) {
            throw new Error(
                `Row ${rowIndex + 1} of the sheet "${sheet.name}" has ${row.length} cells, but the sheet has ` +
                    `${sheet.columns.length} columns.`
            );
        }

        return sheet.columns.map((column, i) => classifyCell(row[i], column.format, invalidText));
    });
}

/**
 * Writes the value of a table cell, with the number format and the highlight of the invalid results.
 * @param cell Excel cell
 * @param classified value already classified (see {@link classifyCell})
 * @param styles styles of the sheet, for the highlight of the invalid results
 */
function writeCell(cell: Cell, classified: ClassifiedCell, styles: XlsxStyles): void {
    switch (classified.kind) {
        case 'empty':
            cell.value = null;
            break;
        case 'text':
            cell.value = classified.text;
            break;
        case 'invalid':
            cell.value = classified.text;
            cell.font = styles.invalidFont;
            cell.alignment = { horizontal: 'right' };
            break;
        case 'number':
            cell.value = classified.value;
            cell.numFmt = xlsxNumberFormat(classified.format);
            break;
    }
}
