import type { PageRequest, PageResult } from './PageRequest';

/**
 * Source of the pages of a table, sorted and paginated by the backend (e.g. a service that accesses a paginated API).
 * Any object with this method works, without extending a class.
 * @template M type of the records
 */
export interface PageDataSource<M> {
    /** Fetches a page of records. */
    findPage(request: PageRequest<M>): Promise<PageResult<M>>;
}
