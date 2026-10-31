import type { Border, Fill, Font } from 'exceljs';

/**
 * Styles of the `.xlsx` file, built from a set of colors so that all sheets look the same and an app can use its own
 * brand colors.
 * @author Manoel Campos
 */

/** Colors of the `.xlsx` file, in the Excel ARGB format (e.g. `FF055087`). */
export type XlsxColors = {
    /** Title, table header background and links. */
    primary: string;

    /** Background of the even rows (zebra stripes). */
    primaryLight: string;

    /** Text of the table header. */
    headerText: string;

    /** Table borders. */
    border: string;

    /** Secondary texts: generation date, info labels and footer. */
    secondaryText: string;

    /** Cells with an invalid result. */
    invalid: string;
};

/** Default colors: a dark blue primary color with a light blue zebra. */
export const DEFAULT_XLSX_COLORS: XlsxColors = {
    primary: 'FF055087',
    primaryLight: 'FFF0F8FF',
    headerText: 'FFFFFFFF',
    border: 'FFD0D7DE',
    secondaryText: 'FF5F6B7A',
    invalid: 'FFC92A2A'
};

/** Fonts, fills and borders of the `.xlsx` file. */
export type XlsxStyles = {
    titleFont: Partial<Font>;
    subtitleFont: Partial<Font>;
    infoLabelFont: Partial<Font>;
    headerFont: Partial<Font>;
    invalidFont: Partial<Font>;
    footerFont: Partial<Font>;
    linkFont: Partial<Font>;
    headerFill: Fill;
    zebraFill: Fill;
    cellBorder: Partial<Record<'top' | 'left' | 'bottom' | 'right', Partial<Border>>>;
};

/**
 * Builds the styles of the `.xlsx` file from a set of colors.
 * @param colors colors of the file; the ones not given use {@link DEFAULT_XLSX_COLORS}
 * @return the fonts, fills and borders of the file
 */
export function xlsxStyles(colors: Partial<XlsxColors> = {}): XlsxStyles {
    const color = { ...DEFAULT_XLSX_COLORS, ...colors };
    const thinBorder: Partial<Border> = { style: 'thin', color: { argb: color.border } };

    return {
        titleFont: { size: 16, bold: true, color: { argb: color.primary } },
        subtitleFont: { size: 10, italic: true, color: { argb: color.secondaryText } },
        infoLabelFont: { bold: true, color: { argb: color.secondaryText } },
        headerFont: { bold: true, color: { argb: color.headerText } },
        invalidFont: { bold: true, color: { argb: color.invalid } },
        footerFont: { size: 9, color: { argb: color.secondaryText } },
        linkFont: { size: 9, underline: true, color: { argb: color.primary } },
        headerFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color.primary } },
        zebraFill: { type: 'pattern', pattern: 'solid', fgColor: { argb: color.primaryLight } },
        cellBorder: { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder }
    };
}

/** Height of the logo in the header (px). The width follows the aspect ratio of the image. */
export const LOGO_HEIGHT = 48;

/** Header rows taken by the logo, so the text is not placed under it. */
export const LOGO_ROWS = 3;

/** Minimum and maximum width of a column, in characters. */
export const MIN_COLUMN_WIDTH = 8;
export const MAX_COLUMN_WIDTH = 60;

/** Room added to the longest text of the column, in characters, so the text does not touch the border. */
export const COLUMN_PADDING = 2;
