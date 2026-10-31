import { Identifiable } from '../model/Identifiable';

/**
 * Destination of the data of a form: creates a record (without an id) or updates an existing one (with an id). Any
 * object with this method works, without extending a class.
 * @template M type of the saved record, returned by the destination
 * @template D type of the data sent by the form (e.g. a DTO, or M itself)
 */
export interface SaveDataSource<M extends Identifiable, D> {
    /**
     * Creates or updates a record.
     * @param id id of the record to update; if absent, the record is created
     * @param data data to save
     * @return the saved record
     */
    save(id: M['id'] | string | undefined, data: D): Promise<M>;
}
