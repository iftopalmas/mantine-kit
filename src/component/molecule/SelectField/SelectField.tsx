import { ReactElement } from 'react';

import { type ComboboxItem, type Primitive, Select, type SelectProps } from '@mantine/core';

import { useKitMessages } from '../../../provider/useKit';
import { withPlaceholderFromLabel } from '../../../util/TransformData';

/**
 * Props of the {@link SelectField}.
 * @template T type of each item of the {@link data} array
 * @template V type of the field value (such as the type of the id of the items). Mantine 9 accepts primitive values
 *           (number, string, boolean), so the form keeps the value with its real type, without converting it to string.
 */
interface SelectFieldProps<T, V extends Primitive> extends Omit<SelectProps<V>, 'data'> {
    /** Items offered in the select. */
    data: T[];

    /**
     * Returns the value of an item, which identifies it uniquely (such as the id). Items without an id (`null` or
     * `undefined`, such as a record not saved yet) are not shown.
     */
    getId: (item: T) => V | null | undefined;

    /** Returns the text shown for an item. */
    getDescription: (item: T) => string;

    /** Text shown when no option matches the search; absent for the one of the locale, built from the label. */
    nothingFoundMessage?: string;

    /**
     * Whether the user can type to filter the options. Default: `true`, since most fields have long lists. Use `false`
     * in fields with few options.
     */
    searchable?: boolean;
}

/**
 * Converts an item of the data of the {@link SelectField} into an option of the select.
 * @param item item to convert
 * @param getId function that returns the value (id) of the item
 * @param getDescription function that returns the text shown for the item
 * @return an array with the option of the item, or an empty array if the item has no id
 */
function toOption<T, V extends Primitive>(
    item: T,
    getId: (item: T) => V | null | undefined,
    getDescription: (item: T) => string
): ComboboxItem<V>[] {
    const value = getId(item);
    return value === null || value === undefined ? [] : [{ value, label: getDescription(item) }];
}

/**
 * Select built from an array of any objects, with a placeholder and a "not found" text built from the label (e.g.
 * "Select the Region"), in the language of the locale.
 */
export function SelectField<T, V extends Primitive = string>({
    data,
    getId,
    getDescription,
    nothingFoundMessage,
    searchable = true,
    ...rest
}: SelectFieldProps<T, V>): ReactElement {
    const messages = useKitMessages().select;
    const transformedData = data.flatMap(item => toOption(item, getId, getDescription));
    const modifiedRest = withPlaceholderFromLabel(messages.placeholder, rest);

    return (
        <Select<V>
            data={transformedData}
            nothingFoundMessage={nothingFoundMessage || messages.nothingFound(String(modifiedRest.label))}
            searchable={searchable}
            {...modifiedRest}
        />
    );
}
