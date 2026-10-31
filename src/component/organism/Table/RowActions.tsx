import { ReactElement } from 'react';

import { ActionIcon, Button, Group, Text, Tooltip } from '@mantine/core';
import { closeAllModals, openModal } from '@mantine/modals';
import { IconEdit, IconEye, IconTrash } from '@tabler/icons-react';

import { TableMessages } from '../../../i18n/KitMessages';
import { useKitMessages, useKitRouter } from '../../../provider/useKit';

/** Size of the action icons (px). */
const ICON_SIZE = 16;

/** Which actions of a row are shown. */
export type RowActionsSettings = {
    canView?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
};

type Props = RowActionsSettings & {
    /** URL opened by the view action. */
    viewUrl: string;

    /** URL opened by the edit action, when there is no `onEdit`; absent for a record not saved yet. */
    editUrl?: string;

    /** Called by the edit action instead of opening `editUrl` (e.g. to edit the row in place). */
    onEdit?: () => void;

    /** Called after the user confirms the deletion. */
    onDelete: () => void;
};

/**
 * Stops the click on an action from reaching the row, which would navigate again and duplicate the history entry.
 * @param event click event
 */
const stopPropagation = (event: React.MouseEvent): void => event.stopPropagation();

/**
 * Asks the user to confirm the deletion of a record.
 * @param messages texts of the table
 * @param cancelLabel text of the cancel button
 * @param confirmLabel text of the confirm button
 * @param onConfirm called when the user confirms
 */
function openDeleteModal(
    messages: TableMessages,
    { cancelLabel, confirmLabel, title }: { cancelLabel: string; confirmLabel: string; title: string },
    onConfirm: () => void
): void {
    openModal({
        title,
        children: (
            <>
                <Text>{messages.deleteConfirm}</Text>

                <Group mt="md" gap="sm" justify="flex-end">
                    <Button variant="transparent" c="dimmed" onClick={() => closeAllModals()}>
                        {cancelLabel}
                    </Button>
                    <Button
                        color="red"
                        onClick={() => {
                            onConfirm();
                            closeAllModals();
                        }}
                    >
                        {confirmLabel}
                    </Button>
                </Group>
            </>
        )
    });
}

/**
 * Action buttons of a table row: view, edit and delete (with confirmation). It reads the router and the texts from
 * the `KitProvider`, so the table does not need to pass them down.
 */
function RowActions({ canView, canEdit, canDelete, viewUrl, editUrl, onEdit, onDelete }: Props): ReactElement {
    const { Link } = useKitRouter();
    const { table, common } = useKitMessages();
    const modalTexts = { title: common.warning, cancelLabel: common.cancel, confirmLabel: common.confirm };

    return (
        <Group gap={4} justify="right" wrap="nowrap">
            {canView && (
                <Tooltip label={table.view}>
                    <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="green"
                        component={Link}
                        onClick={stopPropagation}
                        href={viewUrl}
                        aria-label={table.view}
                    >
                        <IconEye size={ICON_SIZE} />
                    </ActionIcon>
                </Tooltip>
            )}

            {canEdit && onEdit && (
                <Tooltip label={table.edit}>
                    <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        onClick={event => {
                            stopPropagation(event);
                            onEdit();
                        }}
                        aria-label={table.edit}
                    >
                        <IconEdit size={ICON_SIZE} />
                    </ActionIcon>
                </Tooltip>
            )}

            {canEdit && !onEdit && editUrl && (
                <Tooltip label={table.edit}>
                    <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        component={Link}
                        onClick={stopPropagation}
                        href={editUrl}
                        aria-label={table.edit}
                    >
                        <IconEdit size={ICON_SIZE} />
                    </ActionIcon>
                </Tooltip>
            )}

            {canDelete && (
                <Tooltip label={table.delete}>
                    <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={event => {
                            stopPropagation(event);
                            openDeleteModal(table, modalTexts, onDelete);
                        }}
                        aria-label={table.delete}
                    >
                        <IconTrash size={ICON_SIZE} />
                    </ActionIcon>
                </Tooltip>
            )}
        </Group>
    );
}

export default RowActions;
