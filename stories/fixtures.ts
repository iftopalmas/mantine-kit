import { ListDataSource } from '@/src/data/ListDataSource';
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

/** Destination of the region forms, which just echoes the saved data. */
export const regionSaveSource: SaveDataSource<Region, Region> = {
    save: (id, data) => respond({ ...data, id: Number(id) || REGIONS.length + 1 })
};
