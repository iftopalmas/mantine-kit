import { NumberFormat } from '../ExportDocument';

/**
 * Converts a {@link NumberFormat} to the Excel number format code. The code uses `.` and `,` as in the American
 * format, but Excel shows the separators of the language of whoever opens the file (e.g. "1.234,56" in Portuguese).
 * @param format decimal places and whether the value is a percentage (in the 0..1 scale)
 * @return the format code (e.g. `#,##0.00` or `0.0%`)
 */
export function xlsxNumberFormat(format: NumberFormat): string {
    const decimalPart = format.decimals > 0 ? `.${'0'.repeat(format.decimals)}` : '';

    return format.percent ? `0${decimalPart}%` : `#,##0${decimalPart}`;
}
