import { ReactElement } from 'react';
import { DateInput, DateInputProps } from '@mantine/dates';

import { useKitMessages } from '../../../provider/useKit';
import { parseDate } from '../../../util/DateUtil';

export interface DateProps extends DateInputProps {
    label: string;
}

/** Clearable date input in the date format of the locale (e.g. `DD/MM/YYYY` in `pt-BR`). */
export function DateField({ label, value, ...rest }: DateProps): ReactElement {
    const { dateFormat } = useKitMessages().common;

    return (
        <DateInput
            label={label}
            placeholder={dateFormat}
            valueFormat={dateFormat}
            value={parseDate(value, dateFormat)}
            clearable
            {...rest}
        />
    );
}
