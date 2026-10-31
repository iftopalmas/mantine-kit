import type { Meta, StoryObj } from '@storybook/react-vite';

import ExportMenuButton from '@/src/component/molecule/ExportMenuButton/ExportMenuButton';
import { downloadExport } from '@/src/export/ExportDownload';
import { ExportFormat } from '@/src/export/ExportFormat';
import { CSV_FORMAT, EXPORT_FORMATS, XLSX_FORMAT } from '@/src/export/ExportFormats';
import { XlsxFormat } from '@/src/export/xlsx/XlsxFormat';

/**
 * Builds a small document and downloads it in the chosen format.
 * @param format format chosen in the menu
 */
function exportSales(format: ExportFormat): Promise<void> {
    return downloadExport(
        {
            title: 'Sales report',
            fileName: 'sales',
            info: [{ label: 'Period', value: '2026' }],
            generatedAt: new Date(),
            branding: { systemName: 'Storybook', siteUrl: window.location.origin },
            sheets: [
                {
                    name: 'Sales',
                    columns: [
                        { header: 'Product' },
                        { header: 'Quantity', format: { decimals: 0 } },
                        { header: 'Share' }
                    ],
                    rows: [
                        ['Water', 1234, { value: 0.62, format: { decimals: 1, percent: true } }],
                        ['Sewage', 756, { value: 0.38, format: { decimals: 1, percent: true } }]
                    ]
                }
            ]
        },
        format
    );
}

const meta = {
    title: 'Molecules/ExportMenuButton',
    component: ExportMenuButton,
    args: { onExport: exportSales, formats: EXPORT_FORMATS }
} satisfies Meta<typeof ExportMenuButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Downloads a real Excel or CSV file, with the built-in formats. */
export const Default: Story = {};

export const WithFormatDescription: Story = {
    args: { formatDescription: format => (format.multipleSheets ? 'One sheet per table' : 'Only the first table') }
};

/** The export fails, and the error is shown in a notification. */
export const Failing: Story = { args: { onExport: () => Promise.reject(new Error('Server unavailable')) } };

/** Only some of the built-in formats. */
export const OnlyExcel: Story = { args: { formats: [XLSX_FORMAT] } };

/** Excel with the brand colors of the app (green), beside the CSV. */
export const ExcelWithBrandColors: Story = {
    args: { formats: [new XlsxFormat({ colors: { primary: 'FF2B8A3E', primaryLight: 'FFEBFBEE' } }), CSV_FORMAT] }
};

/** A format of the app: any implementation of `ExportFormat` (here, JSON) goes in the menu. */
export const CustomFormat: Story = {
    args: {
        formats: [
            ...EXPORT_FORMATS,
            {
                id: 'json',
                label: 'JSON',
                extension: 'json',
                mimeType: 'application/json',
                multipleSheets: true,
                generate: document => Promise.resolve(new Blob([JSON.stringify(document.sheets, null, 2)]))
            }
        ]
    }
};
