import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ViewTable from '@/src/component/organism/ViewTable/ViewTable';
import { KitProvider } from '@/src/provider/KitProvider';
import { render } from '@/test-utils';

/** The ID column is sortable, so its header is exposed as a button, not as a columnheader. */
const ID_HEADER = /^ID/;

/** Minimal record used in the sort tests. */
type Row = { id: number; name: string; year?: number };

/** Ids of the rows shown in the current page, in the order they appear. */
function shownIds(): number[] {
    return screen.getAllByTestId(/^row-/).map(row => Number(row.getAttribute('data-testid')?.replace('row-', '')));
}

/** Names of the rows shown in the current page, in the order they appear. */
function shownNames(): string[] {
    return screen.getAllByTestId(/^row-/).map(row => within(row).getAllByRole('cell')[1].textContent ?? '');
}

test.each([true, false, undefined])('shows the ID column according to showIdColumn=%s', showIdColumn => {
    render(
        <ViewTable
            data={[{ id: 1, name: 'District A' }]}
            columns={[{ accessor: 'name', title: 'Name' }]}
            showIdColumn={showIdColumn}
        />
    );

    expect(screen.getByRole('cell', { name: 'District A' })).toBeInTheDocument();
    if (showIdColumn === false) {
        expect(screen.queryByRole('button', { name: ID_HEADER })).not.toBeInTheDocument();
        expect(screen.queryByRole('cell', { name: '1' })).not.toBeInTheDocument();
    } else {
        expect(screen.getByRole('button', { name: ID_HEADER })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument();
    }
});

/*
 * Sorting only the page after cutting it would show items 10 to 1 in the first page in descending order, and not the
 * largest ones of the whole set.
 */
test('sorts all records in descending order before paginating', () => {
    const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
    render(
        <ViewTable
            data={rows}
            columns={[{ accessor: 'name', title: 'Name' }]}
            defaultSortStatus={{ columnAccessor: 'id', direction: 'desc' }}
        />
    );

    expect(shownIds()).toEqual([25, 24, 23, 22, 21, 20, 19, 18, 17, 16]);
});

/* Comparing by character codes would place names with accents or in lower case after "Z". */
test('sorts texts according to the locale, considering accents and lower case', () => {
    const rows: Row[] = [
        { id: 1, name: 'Zé Doca' },
        { id: 2, name: 'Palmas' },
        { id: 3, name: 'Água Fria' },
        { id: 4, name: 'brejinho' }
    ];
    render(
        <ViewTable
            data={rows}
            columns={[{ accessor: 'name', title: 'Name' }]}
            defaultSortStatus={{ columnAccessor: 'name', direction: 'asc' }}
        />
    );

    expect(shownNames()).toEqual(['Água Fria', 'brejinho', 'Palmas', 'Zé Doca']);
});

test('uses the given comparison function in the initial order and the one of the column when the header is clicked', async () => {
    const rows: Row[] = [
        { id: 1, name: 'Palmas', year: 2025 },
        { id: 2, name: 'Água Fria', year: 2025 },
        { id: 3, name: 'Palmas', year: 2026 },
        { id: 4, name: 'Água Fria', year: 2026 }
    ];
    // City in alphabetical order and, in the same city, the most recent year first: two criteria.
    const compareCityYear = (a: Row, b: Row) => a.name.localeCompare(b.name, 'pt-BR') || (b.year ?? 0) - (a.year ?? 0);

    const user = userEvent.setup();
    render(
        <ViewTable
            data={rows}
            columns={[{ accessor: 'name', title: 'Name', sortable: true }]}
            compare={compareCityYear}
        />
    );
    expect(shownIds()).toEqual([4, 2, 3, 1]);

    // Sorted only by the column, the order of the records of the same city is the one of the given data.
    await user.click(screen.getByRole('button', { name: /^Name/ }));
    expect(shownIds()).toEqual([2, 4, 1, 3]);
});

/* Without pagination, the table must not cut the records to the size of the first page (10). */
test('without pagination, shows all records', () => {
    const rows: Row[] = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
    render(<ViewTable data={rows} columns={[{ accessor: 'name', title: 'Name' }]} pagination={false} />);

    expect(shownIds()).toHaveLength(rows.length);
});

test('shows the empty table and pagination texts in the locale of the app', () => {
    render(
        <KitProvider locale="pt-BR">
            <ViewTable data={[{ id: 1, name: 'A' }]} columns={[{ accessor: 'name', title: 'Name' }]} />
        </KitProvider>
    );
    expect(screen.getByText('Exibindo 1 a 1 de 1 registros')).toBeInTheDocument();
    expect(screen.getByText('Registros por página')).toBeInTheDocument();
});
