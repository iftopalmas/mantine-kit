import { ReactElement } from 'react';
import { DateInput, DateInputProps } from '@mantine/dates';

import { useKitMessages } from '../../../provider/useKit';
import { DateFieldValue, ISO_DATE_FORMAT, isValidDate, parseDate } from '../../../util/DateUtil';

export interface DateProps extends DateInputProps {
    label: string;
}

/**
 * Reads the value of the field, which is a `YYYY-MM-DD` text when it comes from the `onChange` of `DateInput`.
 * @param format format of the locale, for the texts not in the ISO format
 */
function parseFieldValue(value: DateFieldValue, format: string): Date | null {
    const isoDate = parseDate(value, ISO_DATE_FORMAT);

    return isValidDate(isoDate) ? isoDate : parseDate(value, format);
}

/**
 * Clearable date input in the date format of the locale (e.g. `DD/MM/YYYY` in `pt-BR`).
 * A text `value` can be in that format or in the `YYYY-MM-DD` format `onChange` gives, so it can be controlled with
 * what `onChange` gives.
 */
export function DateField({ label, value, ...rest }: DateProps): ReactElement {
    const { dateFormat } = useKitMessages().common;

    return (
        <DateInput
            label={label}
            placeholder={dateFormat}
            valueFormat={dateFormat}
            value={parseFieldValue(value, dateFormat)}
            clearable
            {...rest}
        />
    );
}
