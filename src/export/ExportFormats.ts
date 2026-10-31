import { CsvFormat } from './csv/CsvFormat';
import { ExportFormat } from './ExportFormat';
import { XlsxFormat } from './xlsx/XlsxFormat';

/**
 * Single instances of the export formats. The formats have no state, so they can be shared by all screens.
 * @author Manoel Campos
 */

/** Excel format (`.xlsx`), with a sheet in the file for each sheet of the document. */
export const XLSX_FORMAT = new XlsxFormat();
export const CSV_FORMAT = new CsvFormat();

/** All built-in export formats, in the order they appear in an export menu. */
export const EXPORT_FORMATS: readonly ExportFormat[] = [XLSX_FORMAT, CSV_FORMAT];
