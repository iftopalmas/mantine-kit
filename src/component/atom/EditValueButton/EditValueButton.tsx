import { ActionIcon, Tooltip } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';

import { useKitMessages } from '../../../provider/useKit';

type Props = {
    onClick: () => void;
};

/** Button that starts editing a table row in place. */
const EditValueButton = ({ onClick }: Props) => {
    const label = useKitMessages().rowEdit.edit;

    return (
        <Tooltip label={label}>
            <ActionIcon size="sm" variant="subtle" color="blue" onClick={onClick} aria-label={label}>
                <IconEdit size={16} />
            </ActionIcon>
        </Tooltip>
    );
};

export default EditValueButton;
