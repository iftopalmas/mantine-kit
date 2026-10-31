import { ExportDocument } from './ExportDocument';

/**
 * Contract every export format must follow (Strategy pattern). Each format generates the file from the same
 * {@link ExportDocument}, so whoever exports chooses the format without knowing the details of each one. To add a
 * format, create the implementation and register it in `ExportFormats.ts`.
 * @author Manoel Campos
 */
export interface ExportFormat {
    /** Unique id of the format (e.g. `xlsx`), used as the key of the format in menus. */
    readonly id: string;

    /** Name of the format shown to the user (e.g. "Excel (.xlsx)"), the same in every language. */
    readonly label: string;

    /** Extension of the file, without the dot. */
    readonly extension: string;

    /** MIME type of the file. */
    readonly mimeType: string;

    /**
     * Whether the format stores many sheets in a single file. A format without sheets (e.g. CSV) accepts only
     * documents with one sheet, so whoever exports must build the document according to this value.
     */
    readonly multipleSheets: boolean;

    /**
     * Generates the file.
     * @param document data to export
     * @return the content of the file
     * @throws Error if the document cannot be exported in the format: without any sheet, with many sheets in a
     *         format without sheets, or with a row with more cells than columns
     */
    generate(document: ExportDocument): Promise<Blob>;
}
