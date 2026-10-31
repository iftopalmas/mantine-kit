import { ReactNode } from 'react';

import { formatDateToISO } from './DateUtil';

/**
 * Converts a form value to the format sent to the backend: dates in ISO 8601, recursively inside arrays and objects.
 * @param value value of a form field
 */
function formatValue(value: unknown): unknown {
    if (value instanceof Date) return formatDateToISO(value);
    if (Array.isArray(value)) return value.map(formatValue);
    if (typeof value === 'object' && value !== null) return formatValues(value);

    return value;
}

/** Converts the dates of the form data, without changing the input or the structure of the arrays. */
export function formatValues(obj: object): Record<string, unknown> {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, formatValue(value)]));
}

/**
 * If the props of a component have no `placeholder`, builds the placeholder from the `label` prop (e.g. the label
 * "Region" gives "Select the Region" in `en-US`). It is not a React hook: it just transforms the given props.
 * @param placeholder function that builds the placeholder from the label
 * @param props props of the component
 * @return a copy of the props, with the given placeholder or the one built from the label
 */
export const withPlaceholderFromLabel = <P extends { placeholder?: string; label?: ReactNode }>(
    placeholder: (label: string) => string,
    props: P
): P => ({ ...props, placeholder: props.placeholder || placeholder(String(props.label)) });
