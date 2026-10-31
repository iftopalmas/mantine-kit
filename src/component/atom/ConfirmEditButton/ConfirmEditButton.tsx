import { ActionIcon, Tooltip } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

import { useKitMessages } from '../../../provider/useKit';

type Props = {
    onClick: () => void;

    /** Disabled while no value of the row was changed (nothing to confirm). */
    disabled?: boolean;
};

/**
 * Button that confirms the editing of a table row edited in place.
 *
 * The `<span>` around the `ActionIcon` keeps the `Tooltip` working while the button is `disabled`: a disabled native
 * HTML element fires no pointer events, so the `Tooltip` could not detect the hover on the button itself.
 */
const ConfirmEditButton = ({ onClick, disabled }: Props) => {
    const label = useKitMessages().rowEdit.confirm;

    return (
        <Tooltip label={label}>
            <span>
                <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="green"
                    onClick={onClick}
                    disabled={disabled}
                    aria-label={label}
                >
                    <IconCheck size={16} />
                </ActionIcon>
            </span>
        </Tooltip>
    );
};

export default ConfirmEditButton;
