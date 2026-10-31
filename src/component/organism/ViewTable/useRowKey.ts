import { Key, useCallback, useRef } from 'react';

import { Identifiable } from '../../../model/Identifiable';

/**
 * Returns the function that gives each record of a table a unique and stable key, without changing the record: its id
 * or, for a record not saved yet (without id), a key kept per object while the table is mounted.
 * @return a function that returns the key of a record, to use as the `idAccessor` of mantine-datatable
 */
export function useRowKey<M extends Identifiable>(): (record: M) => Key {
    // Keys of the records without id, by object: they disappear with the object, without keeping it in memory.
    const generatedKeys = useRef(new WeakMap<M, string>());
    const nextKey = useRef(0);

    return useCallback((record: M) => {
        if (record.id !== null && record.id !== undefined && record.id !== '') return record.id;

        let key = generatedKeys.current.get(record);
        if (key === undefined) {
            key = `unsaved-${nextKey.current++}`;
            generatedKeys.current.set(record, key);
        }

        return key;
    }, []);
}
