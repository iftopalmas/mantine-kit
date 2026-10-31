import { ExportDocument, ExportSheet, invalidCell } from '@/src/export/ExportDocument';

/**
 * Generic data for the export tests, without any domain data: it shows that the export depends on no domain.
 */

/** 1x1 pixel PNG, to test the logo without reading a file. */
export const PNG_1PX =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

export const GENERATED_AT = new Date(2026, 9, 20, 14, 30);

/** Sheet with text, a number in the column format, a number with its own format, zero, absent and invalid values. */
export const SHEET: ExportSheet = {
    name: 'Sales',
    columns: [{ header: 'Product name' }, { header: 'Quantity', format: { decimals: 0 } }, { header: '2026' }],
    rows: [
        ['Water', 1234, { value: 0.855, format: { decimals: 1, percent: true } }],
        ['Sewage', 0, undefined],
        ['Waste', Number.NaN, invalidCell()]
    ]
};

/**
 * Builds a document for the tests.
 * @param sheets sheets of the document
 * @param withLogo whether the document has the logo
 * @return the document
 */
export function exportDocument(sheets: ExportSheet[] = [SHEET], withLogo: boolean = true): ExportDocument {
    return {
        title: 'Sales report',
        fileName: 'Sales report',
        info: [
            { label: 'Period', value: '2026 to 2030' },
            { label: 'Filter', value: 'All' }
        ],
        generatedAt: GENERATED_AT,
        branding: {
            systemName: 'System',
            siteUrl: 'https://system.example.com',
            logo: withLogo ? { pngDataUrl: PNG_1PX, width: 1, height: 1 } : undefined
        },
        sheets
    };
}
