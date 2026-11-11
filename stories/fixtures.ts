import { ListDataSource } from '@/src/data/ListDataSource';
import { FetchPage } from '@/src/data/PageRequest';
import { SaveDataSource } from '@/src/data/SaveDataSource';

/**
 * Sample data for the stories: regions kept in memory, with the data sources the tables and forms use. It shows that
 * the components work with any object that has the methods of the contracts, without an API.
 */

/** Record shown in the table and form stories. */
export type Region = { id?: number | null; name: string; cities: number };

/** Sample regions. */
export const REGIONS: Region[] = [
    { id: 1, name: 'North', cities: 34 },
    { id: 2, name: 'Center', cities: 51 },
    { id: 3, name: 'South', cities: 28 },
    { id: 4, name: 'Southeast', cities: 26 }
];

/** Time to answer, to show the loading state of the components (ms). */
const LATENCY = 400;

/**
 * Resolves a value after {@link LATENCY}, as an API would.
 * @param value value of the response
 */
function respond<T>(value: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(value), LATENCY));
}

/** Source of the regions of the tables, which deletes from a copy of {@link REGIONS}. */
export function regionListSource(): ListDataSource<Region> {
    let regions = [...REGIONS];

    return {
        findAll: () => respond([...regions]),
        delete: async id => {
            regions = regions.filter(region => region.id !== Number(id));
            await respond(undefined);
        }
    };
}

/** Number of regions of {@link regionPageSource}, enough to have many pages. */
const PAGED_REGIONS_COUNT = 42;

/**
 * Source of regions that paginates and sorts them as a backend would, so the table only ever receives one page. It
 * also deletes, so the same object is the `service` and gives the `fetchPage` of a table.
 */
export function regionPageSource(): ListDataSource<Region> & { fetchPage: FetchPage<Region> } {
    let regions: Region[] = Array.from({ length: PAGED_REGIONS_COUNT }, (_, i) => ({
        id: i + 1,
        name: `Region ${i + 1}`,
        cities: (i * 7) % 50
    }));

    return {
        findAll: () => respond([...regions]),
        delete: async id => {
            regions = regions.filter(region => region.id !== Number(id));
            await respond(undefined);
        },
        fetchPage: ({ page, size, sort }) => {
            const key = sort.columnAccessor as keyof Region;
            const direction = sort.direction === 'asc' ? 1 : -1;
            const sorted = [...regions].sort(
                (a, b) => direction * String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true })
            );
            const from = (page - 1) * size;

            return respond({ records: sorted.slice(from, from + size), totalRecords: regions.length });
        }
    };
}

/** Destination of the region forms, which just echoes the saved data. */
export const regionSaveSource: SaveDataSource<Region, Region> = {
    save: (id, data) => respond({ ...data, id: Number(id) || REGIONS.length + 1 })
};
