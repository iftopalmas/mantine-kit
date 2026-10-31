import { Identifiable } from '../model/Identifiable';

/**
 * Source of the records of a table that allows deleting them (e.g. a service that accesses a REST API). Any object
 * with these methods works, without extending a class.
 * @template M type of the records
 */
export interface ListDataSource<M extends Identifiable> {
    /** Fetches all records shown in the table. */
    findAll(): Promise<M[]>;

    /** Deletes the record with the given id. */
    delete(id: number | string): Promise<void>;
}
