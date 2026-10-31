'use client';

import { ReactElement, useState } from 'react';

import { Button, ButtonProps, Menu, Text } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

import type { ExportFormat } from '../../../export/ExportFormat';
import { useKitMessages } from '../../../provider/useKit';
import { showErrorNotification } from '../../../util/Notifications';

/** Size of the button icon (px). */
const ICON_SIZE = 18;

type Props = Omit<ButtonProps, 'children' | 'leftSection' | 'loading'> & {
    /**
     * Exports the data in the chosen format. While the `Promise` is running, the button shows it is loading; if it
     * fails, the error is shown in a notification.
     */
    onExport: (format: ExportFormat) => Promise<void>;

    /**
     * Formats offered in the menu, in their order: the built-in ones (e.g. `EXPORT_FORMATS` or just `XLSX_FORMAT`, from
     * `export/ExportFormats`) or any other implementation of {@link ExportFormat}.
     */
    formats: readonly ExportFormat[];

    /** Text of the button; absent for the one of the locale. */
    label?: string;

    /** Text shown below the name of a format in the menu (e.g. what is exported in it); absent for none. */
    formatDescription?: (format: ExportFormat) => string | undefined;
};

/**
 * "Export" button, with a menu of the given export formats. It knows neither what is exported nor how: whoever uses it
 * chooses the formats and generates the file in {@link Props.onExport}.
 */
function ExportMenuButton({ onExport, formats, label, formatDescription, ...buttonProps }: Props): ReactElement {
    const messages = useKitMessages();
    const [exporting, setExporting] = useState(false);

    async function exportFormat(format: ExportFormat): Promise<void> {
        setExporting(true);
        try {
            await onExport(format);
        } catch (error) {
            showErrorNotification(error, messages.export.failed(format.label), messages.common.error);
        } finally {
            setExporting(false);
        }
    }

    return (
        <Menu position="bottom-end" withinPortal>
            <Menu.Target>
                <Button
                    variant="light"
                    leftSection={<IconDownload size={ICON_SIZE} />}
                    loading={exporting}
                    {...buttonProps}
                >
                    {label ?? messages.export.button}
                </Button>
            </Menu.Target>

            <Menu.Dropdown>
                {formats.map(format => (
                    <Menu.Item key={format.id} onClick={() => exportFormat(format)}>
                        {format.label}
                        {formatDescription?.(format) && (
                            <Text size="xs" c="dimmed">
                                {formatDescription(format)}
                            </Text>
                        )}
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    );
}

export default ExportMenuButton;
