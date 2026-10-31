import { columnComparator } from '@/src/component/organism/ViewTable/ColumnComparator';

/** Record with a nested attribute, such as `city.name`. */
type Row = { id: number; city?: { name: string } };

const rows: Row[] = [
    { id: 1, city: { name: 'Palmas' } },
    { id: 2 },
    { id: 3, city: { name: 'Água Fria' } },
    { id: 4, city: { name: 'Zé Doca' } }
];

/** Ids of the records sorted by the given column and direction. */
function sortedIds(direction: 'asc' | 'desc'): number[] {
    return [...rows].sort(columnComparator<Row>({ columnAccessor: 'city.name', direction })).map(row => row.id);
}

describe('columnComparator', () => {
    test('sorts by the path of the attribute in ascending order, according to the locale', () => {
        expect(sortedIds('asc')).toEqual([3, 1, 4, 2]);
    });

    // In descending order, the records without a value cannot take the first page.
    test('reverses the order in the descending direction, keeping the records without a value last', () => {
        expect(sortedIds('desc')).toEqual([4, 1, 3, 2]);
    });
});
