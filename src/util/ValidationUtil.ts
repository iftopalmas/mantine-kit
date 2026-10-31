import { z } from 'zod';

/**
 * Creates the validation rule of a required field that stores the id of an item chosen in a select (e.g. the region
 * of a city). The field starts with `0` (nothing chosen) and receives `null` when the select is cleared; in both cases,
 * the validation fails with the given message.
 * @param message message shown in the field when no valid item was chosen
 * @return the Zod schema that accepts only positive integer ids
 */
export function selectedId(message: string): z.ZodNumberFormat {
    return z.int({ error: message }).positive({ error: message });
}
