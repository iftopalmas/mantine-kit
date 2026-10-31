import { ExportDocument } from './ExportDocument';
import { exportFileName } from './ExportFileName';
import { ExportFormat } from './ExportFormat';
import { exportMessages } from './ExportTexts';
import { downloadBlob } from '../util/DownloadUtil';

/**
 * Generates the file of a document in the chosen format and makes the browser download it, named after the document,
 * with the generation date and the extension of the format.
 * @param document data to export
 * @param format format of the file
 */
export async function downloadExport(document: ExportDocument, format: ExportFormat): Promise<void> {
    const blob = await format.generate(document);
    const defaultName = exportMessages(document).defaultFileName;
    downloadBlob(blob, exportFileName(document.fileName, document.generatedAt, format.extension, defaultName));
}
