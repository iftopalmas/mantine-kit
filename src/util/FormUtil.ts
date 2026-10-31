import type { UseFormReturnType } from '@mantine/form';

import { Identifiable } from '../model/Identifiable';

/**
 * Fills a form with the data of a saved record. A record without an id (not saved yet) is ignored.
 * @param initialize {@link UseFormReturnType#initialize} function of the form
 * @param data data to fill the form with
 */
export function initForm<D extends Identifiable>(initialize: UseFormReturnType<D>['initialize'], data: D | null): void {
    if (!data?.id) return;

    initialize(data);
}
