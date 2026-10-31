import { describe, expect, test } from '@jest/globals';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ExportMenuButton from '@/src/component/molecule/ExportMenuButton/ExportMenuButton';
import { ExportFormat } from '@/src/export/ExportFormat';
import { EXPORT_FORMATS, XLSX_FORMAT } from '@/src/export/ExportFormats';
import { KitProvider } from '@/src/provider/KitProvider';
import { showErrorNotification } from '@/src/util/Notifications';
import { render } from '@/test-utils';

jest.mock('@/src/util/Notifications', () => ({ showErrorNotification: jest.fn() }));

describe('ExportMenuButton', () => {
    test('exports in the format chosen in the menu', async () => {
        const user = userEvent.setup();
        const onExport = jest.fn(() => Promise.resolve());
        render(<ExportMenuButton onExport={onExport} formats={EXPORT_FORMATS} />);

        await user.click(screen.getByRole('button', { name: 'Export' }));
        await user.click(await screen.findByRole('menuitem', { name: XLSX_FORMAT.label }));

        expect(onExport).toHaveBeenCalledWith(XLSX_FORMAT);
    });

    test('shows the error in a notification when the export fails', async () => {
        const user = userEvent.setup();
        const error = new Error('failed');
        const onExport = jest.fn(() => Promise.reject(error));
        render(<ExportMenuButton onExport={onExport} formats={EXPORT_FORMATS} label="Download" />);

        await user.click(screen.getByRole('button', { name: 'Download' }));
        await user.click(await screen.findByRole('menuitem', { name: XLSX_FORMAT.label }));

        await waitFor(() =>
            expect(showErrorNotification).toHaveBeenCalledWith(error, 'Could not export to Excel (.xlsx).', 'Error')
        );
        expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
    });

    test('uses the label of the locale of the app', () => {
        render(
            <KitProvider locale="pt-BR">
                <ExportMenuButton onExport={() => Promise.resolve()} formats={EXPORT_FORMATS} />
            </KitProvider>
        );

        expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();
    });

    // Any implementation of the contract works, not only the built-in formats.
    test('offers only the given formats, including formats of the app', async () => {
        const user = userEvent.setup();
        const json: ExportFormat = {
            id: 'json',
            label: 'JSON',
            extension: 'json',
            mimeType: 'application/json',
            multipleSheets: true,
            generate: document => Promise.resolve(new Blob([JSON.stringify(document.sheets)]))
        };
        const onExport = jest.fn(() => Promise.resolve());
        render(<ExportMenuButton onExport={onExport} formats={[json]} />);

        await user.click(screen.getByRole('button', { name: 'Export' }));
        expect((await screen.findAllByRole('menuitem')).map(item => item.textContent)).toEqual(['JSON']);
        await user.click(screen.getByRole('menuitem', { name: 'JSON' }));

        expect(onExport).toHaveBeenCalledWith(json);
    });
});
