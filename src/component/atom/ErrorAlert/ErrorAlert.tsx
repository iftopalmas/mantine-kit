import { ReactNode } from 'react';

import { Alert, AlertProps } from '@mantine/core';
import { IconBug } from '@tabler/icons-react';

type Props = { message: ReactNode } & AlertProps;

/** Red alert that shows an error message (e.g. when the data of a component cannot be loaded). */
const ErrorAlert = ({ message, ...others }: Props) => {
    const icon = <IconBug size={18} />;
    const { title } = others;

    return (
        <Alert variant="light" color="red" title={title} icon={icon} {...others}>
            {message || ''}
        </Alert>
    );
};

export default ErrorAlert;
