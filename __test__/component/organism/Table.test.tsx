import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Table from '@/src/component/organism/Table/Table';
import type { ListDataSource } from '@/src/data/ListDataSource';
import type { Identifiable } from '@/src/model/Identifiable';
import { KitProvider } from '@/src/provider/KitProvider';
import { PORTUGUESE_FORM_ROUTE_SEGMENTS } from '@/src/router/FormRouteSegments';
import { createTestRouter, render } from '@/test-utils';

const { router, navigate } = createTestRouter();

interface Row extends Identifiable {
    name: string;
}

const rows: Row[] = [{ id: 7, name: 'North' }];

/** The data source is not called, since the data comes from customFetchMethod. */
const service = {} as ListDataSource<Row>;

/**
 * Renders the table of a list page and waits for the data to load.
 * @param getViewUrl custom view URL; if absent, the table uses the default view route
 */
async function renderTable(getViewUrl?: (item: Row) => string): Promise<void> {
    render(
        <Table
            service={service}
            customFetchMethod={() => Promise.resolve(rows)}
            columns={[{ accessor: 'name', title: 'Name' }]}
            basePath="/region"
            getViewUrl={getViewUrl}
        />,
        { router }
    );
    await screen.findByRole('cell', { name: 'North' });
}

/** Returns the addresses of the links of the table (view and edit icons). */
function linkHrefs(): (string | null)[] {
    return screen.getAllByRole('link').map(link => link.getAttribute('href'));
}

beforeEach(() => navigate.mockReset());

/* The whole row is clickable; the highlight on hover shows that to the user. */
test('highlights the row under the mouse', async () => {
    await renderTable();

    expect(screen.getByRole('table')).toHaveAttribute('data-highlight-on-hover');
});

/* The default highlight color is barely distinguishable from the zebra stripes of the table, so users missed it. */
test('uses a highlight color different from the zebra stripes', async () => {
    await renderTable();

    const root = screen.getByRole('table').closest<HTMLElement>('.mantine-datatable');
    expect(root?.style.getPropertyValue('--mantine-datatable-highlight-on-hover-color-light')).toBe(
        'var(--mantine-primary-color-light)'
    );
});

test('opens the view of the record when the row is clicked', async () => {
    await renderTable();

    await userEvent.click(screen.getByRole('cell', { name: 'North' }));

    expect(navigate).toHaveBeenCalledWith('/region/view/7');
    expect(linkHrefs()).toContain('/region/view/7');
});

/* Records whose content is not the form itself may open another page. */
test('uses the custom view URL when the row and the view icon are clicked', async () => {
    await renderTable(item => `/other/${item.id}`);

    await userEvent.click(screen.getByRole('cell', { name: 'North' }));

    expect(navigate).toHaveBeenCalledWith('/other/7');
    expect(linkHrefs()).toEqual(['/other/7', '/region/edit/7']);
});

/* The link already navigates; if the click reached the row, it would navigate again and duplicate the history entry. */
test('does not pass the click on the view icon to the row', async () => {
    await renderTable();
    const viewLink = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/region/view/7');

    await userEvent.click(viewLink!);

    expect(navigate).not.toHaveBeenCalled();
});

test('uses the texts of the locale and the route segments chosen by the app', async () => {
    render(
        <KitProvider router={router} locale="pt-BR" formRouteSegments={PORTUGUESE_FORM_ROUTE_SEGMENTS}>
            <Table
                service={service}
                customFetchMethod={() => Promise.resolve(rows)}
                columns={[{ accessor: 'name', title: 'Name' }]}
                basePath="/region"
            />
        </KitProvider>
    );
    await screen.findByRole('cell', { name: 'North' });

    expect(screen.getByText('Ações')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Visualizar' })).toHaveAttribute('href', '/region/visualizar/7');
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/region/editar/7');
    expect(screen.getByRole('button', { name: 'Deletar' })).toBeInTheDocument();
});

test('calls the custom edit function instead of opening the edit page', async () => {
    const onEdit = jest.fn();
    render(
        <Table
            service={service}
            customFetchMethod={() => Promise.resolve(rows)}
            columns={[{ accessor: 'name', title: 'Name' }]}
            basePath="/region"
            customEditFunction={onEdit}
        />,
        { router }
    );
    await screen.findByRole('cell', { name: 'North' });

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(7);
    expect(navigate).not.toHaveBeenCalled();
});

test('hides the actions column when asked', async () => {
    render(
        <Table
            service={service}
            customFetchMethod={() => Promise.resolve(rows)}
            columns={[{ accessor: 'name', title: 'Name' }]}
            basePath="/region"
            actionsSettings={{ canShowActions: false }}
        />,
        { router }
    );
    await screen.findByRole('cell', { name: 'North' });

    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
});

test('shows an alert when the data cannot be loaded', async () => {
    render(
        <Table
            service={service}
            customFetchMethod={() => Promise.reject(new Error('HTTP 500'))}
            columns={[{ accessor: 'name', title: 'Name' }]}
            basePath="/region"
        />,
        { router }
    );

    expect(await screen.findByText('Error loading data')).toBeInTheDocument();
    expect(screen.getByText('Error: HTTP 500')).toBeInTheDocument();
});
