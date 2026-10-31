import { ActionIcon, Tooltip } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

import { useKitMessages } from '../../../provider/useKit';

type Props = {
    onClick: () => void;
};

/** Button that cancels the editing of a table row edited in place. */
const CancelEditButton = ({ onClick }: Props) => {
    const label = useKitMessages().rowEdit.cancel;

    return (
        <Tooltip label={label}>
            <ActionIcon size="sm" variant="subtle" color="red" onClick={onClick} aria-label={label}>
                <IconX size={16} />
            </ActionIcon>
        </Tooltip>
    );
};

export default CancelEditButton;
