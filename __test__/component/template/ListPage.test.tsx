import { screen } from '@testing-library/react';

import ListPage from '@/src/component/template/ListPage/ListPage';
import { render } from '@/test-utils';

/** Renders the page with the given filters and a stand-in for the table. */
function renderPage(filters?: React.ReactNode): void {
    render(
        <ListPage title="Regions" titlePlural="regions" breadcrumbItems={[]} filters={filters}>
            <p>Table of the records</p>
        </ListPage>
    );
}

/* The page only lays out the header, the filters and the table, so it accepts any table given as children. */
test('shows the table given as children, inside the card with the title of the list', () => {
    renderPage();

    expect(screen.getByText('Table of the records')).toBeInTheDocument();
    expect(screen.getByText(/regions/)).toBeInTheDocument();
});

test('shows the filters above the table', () => {
    renderPage(<label>Name filter</label>);

    const filter = screen.getByText('Name filter');
    const table = screen.getByText('Table of the records');
    expect(filter.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
