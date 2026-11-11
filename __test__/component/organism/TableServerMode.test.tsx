import { ModalsProvider } from '@mantine/modals';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReactElement } from 'react';

import Table from '@/src/component/organism/Table/Table';
import { useServerPagination } from '@/src/component/organism/Table/useServerPagination';
import type { ListDataSource } from '@/src/data/ListDataSource';
import type { PageDataSource } from '@/src/data/PageDataSource';
import type { FetchPage, PageRequest, PageResult } from '@/src/data/PageRequest';
import type { Identifiable } from '@/src/model/Identifiable';
import { render } from '@/test-utils';

interface Row extends Identifiable {
    name: string;
}

/** Size of the first option of records per page. */
const PAGE_SIZE = 10;

/** Column whose sort is sent to the backend by a key different from its accessor. */
const COLUMNS = [{ accessor: 'name', title: 'Name', sortable: true, sortKey: 'name_key' }];

/** Table whose records come from `fetchPage`, sorted and paginated by the backend, as an app uses it. */
function ServerTable({
    fetchPage,
    service,
    firstPage
}: {
    fetchPage: PageDataSource<Row> | FetchPage<Row>;
    service: ListDataSource<Row>;
    firstPage?: number;
}): ReactElement {
    const data = useServerPagination(fetchPage, { firstPage });

    return <Table data={data} service={service} columns={COLUMNS} basePath="/row" />;
}

/** Simulated backend: the function that fetches a page and the data source that deletes. */
type Backend = {
    fetchPage: jest.Mock<ReturnType<FetchPage<Row>>, [PageRequest<Row>]>;
    service: ListDataSource<Row>;
};

/** Backend that answers with the records of the requested page, in a fixed order, keeping what was deleted. */
function createBackend(totalRecords: number): Backend {
    let rows: Row[] = Array.from({ length: totalRecords }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
    const fetchPage = jest.fn<ReturnType<FetchPage<Row>>, [PageRequest<Row>]>(({ page, size }) => {
        const from = (page - 1) * size;

        return Promise.resolve({ records: rows.slice(from, from + size), totalRecords: rows.length });
    });
    const service: ListDataSource<Row> = {
        findAll: jest.fn(),
        delete: async id => {
            rows = rows.filter(row => row.id !== id);
        }
    };

    return { fetchPage, service };
}

/** Names shown in the rows, in the order they appear. */
function shownNames(): string[] {
    return screen.getAllByTestId(/^row-/).map(row => within(row).getAllByRole('cell')[1].textContent ?? '');
}

/** Clicks a pagination button by its page number. */
async function goToPage(page: number): Promise<void> {
    await userEvent.click(screen.getByRole('button', { name: String(page) }));
}

/** Renders a table in server mode and waits for the first page. */
async function renderServerTable({ fetchPage, service }: Backend): Promise<void> {
    render(
        <ModalsProvider>
            <ServerTable service={service} fetchPage={fetchPage} />
        </ModalsProvider>
    );
    await screen.findByRole('cell', { name: 'Item 1' });
}

test('fetches the first page, shows the records as received and the total of the response', async () => {
    const backend = createBackend(25);
    backend.fetchPage.mockResolvedValueOnce({
        records: [
            { id: 1, name: 'Item 1' },
            { id: 9, name: 'A comes last, as the backend ordered' }
        ],
        totalRecords: 25
    });

    await renderServerTable(backend);

    expect(backend.fetchPage).toHaveBeenCalledTimes(1);
    expect(backend.fetchPage).toHaveBeenCalledWith({
        page: 1,
        size: PAGE_SIZE,
        sort: { columnAccessor: 'id', direction: 'asc' }
    });
    expect(backend.service.findAll).not.toHaveBeenCalled();
    expect(shownNames()).toEqual(['Item 1', 'A comes last, as the backend ordered']);
    expect(screen.getByText(/of 25/)).toBeInTheDocument();
});

test('fetches the chosen page, without cutting it in the browser', async () => {
    const backend = createBackend(25);
    await renderServerTable(backend);

    await goToPage(3);

    await screen.findByRole('cell', { name: 'Item 21' });
    expect(backend.fetchPage).toHaveBeenLastCalledWith(expect.objectContaining({ page: 3, size: PAGE_SIZE }));
    expect(shownNames()).toHaveLength(5);
});

test('sends the sortKey of the column and goes back to page 1 when the sort changes', async () => {
    const backend = createBackend(25);
    await renderServerTable(backend);
    await goToPage(2);
    await screen.findByRole('cell', { name: 'Item 11' });

    await userEvent.click(screen.getByRole('button', { name: /^Name/ }));

    await screen.findByRole('cell', { name: 'Item 1' });
    expect(backend.fetchPage).toHaveBeenLastCalledWith(
        expect.objectContaining({
            page: 1,
            sort: expect.objectContaining({ columnAccessor: 'name_key', direction: 'asc' })
        })
    );
});

test('goes back to page 1 when the page size changes', async () => {
    const backend = createBackend(25);
    await renderServerTable(backend);
    await goToPage(2);
    await screen.findByRole('cell', { name: 'Item 11' });

    await userEvent.click(screen.getByRole('button', { name: String(PAGE_SIZE) }));
    await userEvent.click(await screen.findByRole('menuitem', { name: '20' }));

    await screen.findByRole('cell', { name: 'Item 1' });
    expect(backend.fetchPage).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, size: 20 }));
});

/* A new fetchPage means the filter changed. The old page must not reach the backend along with the new filter. */
test('goes back to page 1 with a single fetch when fetchPage changes', async () => {
    const backend = createBackend(25);
    const { rerender } = render(<ServerTable service={backend.service} fetchPage={backend.fetchPage} />);
    await screen.findByRole('cell', { name: 'Item 1' });
    await goToPage(2);
    await screen.findByRole('cell', { name: 'Item 11' });

    const filtered: FetchPage<Row> = jest.fn(() =>
        Promise.resolve({ records: [{ id: 100, name: 'Filtered' }], totalRecords: 1 })
    );
    rerender(<ServerTable service={backend.service} fetchPage={filtered} />);

    await screen.findByRole('cell', { name: 'Filtered' });
    expect(filtered).toHaveBeenCalledTimes(1);
    expect(filtered).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
});

test('fetches the current page again after deleting a record', async () => {
    const backend = createBackend(25);
    await renderServerTable(backend);
    await goToPage(2);
    await screen.findByRole('cell', { name: 'Item 11' });

    await confirmDeletionOfFirstRow();

    await waitFor(() => expect(screen.queryByRole('cell', { name: 'Item 11' })).not.toBeInTheDocument());
    expect(shownNames()[0]).toBe('Item 12');
    expect(backend.fetchPage).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
});

test('goes back to the previous page after deleting the last record of the last page', async () => {
    const backend = createBackend(21);
    await renderServerTable(backend);
    await goToPage(3);
    await screen.findByRole('cell', { name: 'Item 21' });

    await confirmDeletionOfFirstRow();

    await screen.findByRole('cell', { name: 'Item 11' });
    expect(backend.fetchPage).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
});

/** Clicks the delete action of the first row and confirms it. */
async function confirmDeletionOfFirstRow(): Promise<void> {
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Confirm' }));
}

test('shows an alert when a page cannot be fetched', async () => {
    const fetchPage: FetchPage<Row> = () => Promise.reject(new Error('HTTP 500'));
    render(<ServerTable service={createBackend(0).service} fetchPage={fetchPage} />);

    expect(await screen.findByText('Error: HTTP 500')).toBeInTheDocument();
});

/* Spring Data numbers the pages from 0, but users still see them from 1. */
test('sends the pages starting at firstPage, while showing them starting at 1', async () => {
    const backend = createBackend(25);
    const fetchPage = jest.fn<ReturnType<FetchPage<Row>>, [PageRequest<Row>]>(request =>
        backend.fetchPage({ ...request, page: request.page + 1 })
    );
    render(<ServerTable service={backend.service} fetchPage={fetchPage} firstPage={0} />);
    await screen.findByRole('cell', { name: 'Item 1' });

    await goToPage(3);

    await screen.findByRole('cell', { name: 'Item 21' });
    expect(fetchPage.mock.calls.map(([request]) => request.page)).toEqual([0, 2]);
});

/** Service whose method reads a field, so it fails if the hook calls it without its `this`. */
class PageService implements PageDataSource<Row> {
    readonly backend = createBackend(25);

    findPage = jest.fn(function (this: PageService, request: PageRequest<Row>): Promise<PageResult<Row>> {
        return this.backend.fetchPage(request);
    });
}

test('fetches the page once from a stable data source object, keeping the this of its method', async () => {
    const pageService = new PageService();
    const { rerender } = render(<ServerTable service={pageService.backend.service} fetchPage={pageService} />);
    await screen.findByRole('cell', { name: 'Item 1' });

    rerender(<ServerTable service={pageService.backend.service} fetchPage={pageService} />);

    expect(pageService.findPage).toHaveBeenCalledTimes(1);
    expect(pageService.findPage).toHaveBeenCalledWith(expect.objectContaining({ page: 1, size: PAGE_SIZE }));
});
