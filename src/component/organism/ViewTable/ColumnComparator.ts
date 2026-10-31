import { DataTableSortStatus, getValueAtPath } from 'mantine-datatable';

import { DEFAULT_LOCALE } from '../../../i18n/KitLocale';
import { compareValues, isAbsent } from '../../../util/CompareUtil';

/** Comparison function for `Array.prototype.sort`: negative if `a` comes before `b`, positive if it comes after. */
export type Comparator<M> = (a: M, b: M) => number;

/**
 * Returns the function that sorts the records by the column and direction chosen in the table header. Texts follow
 * the locale (see {@link compareValues}). Records without a value in the column always come last, so they do not take
 * the first pages in the descending order.
 * @param sortStatus column (path of the attribute, e.g. `city.name`) and direction of the sort
 * @param locale locale of the text comparison; defaults to `en-US`
 */
export function columnComparator<M>(
    sortStatus: DataTableSortStatus<M>,
    locale: string = DEFAULT_LOCALE
): Comparator<M> {
    const accessor = String(sortStatus.columnAccessor);
    const descending = sortStatus.direction === 'desc';

    return (a, b) => {
        const valueA: unknown = getValueAtPath(a, accessor);
        const valueB: unknown = getValueAtPath(b, accessor);
        const result = compareValues(valueA, valueB, locale);

        return descending && !isAbsent(valueA) && !isAbsent(valueB) ? -result : result;
    };
}
