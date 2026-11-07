import { screen } from '@testing-library/react';

import ListPage from '@/src/component/template/ListPage/ListPage';
import type { ListDataSource } from '@/src/data/ListDataSource';
import type { Identifiable } from '@/src/model/Identifiable';
import { render } from '@/test-utils';

interface Row extends Identifiable {
    name: string;
}

const service: ListDataSource<Row> = { findAll: jest.fn(() => Promise.resolve([])), delete: jest.fn() };

/** Props of the page that do not depend on how the records are fetched. */
const PAGE_PROPS = {
    title: 'Rows',
    titlePlural: 'Rows',
    breadcrumbItems: [],
    service,
    resourceBasePath: '/row',
    tableColumns: [{ accessor: 'name', title: 'Name' }]
};

beforeEach(() => jest.clearAllMocks());

test('forwards fetchPage to the table', async () => {
    const fetchPage = jest.fn(() => Promise.resolve({ records: [{ id: 1, name: 'Paged' }], totalRecords: 30 }));

    render(<ListPage<Row, ListDataSource<Row>> {...PAGE_PROPS} fetchPage={fetchPage} />);

    expect(await screen.findByRole('cell', { name: 'Paged' })).toBeInTheDocument();
    expect(screen.getByText(/of 30/)).toBeInTheDocument();
    expect(service.findAll).not.toHaveBeenCalled();
});

test('forwards customFetchMethod to the table', async () => {
    const customFetchMethod = () => Promise.resolve([{ id: 1, name: 'Custom' }]);

    render(<ListPage<Row, ListDataSource<Row>> {...PAGE_PROPS} customFetchMethod={customFetchMethod} />);

    expect(await screen.findByRole('cell', { name: 'Custom' })).toBeInTheDocument();
    expect(service.findAll).not.toHaveBeenCalled();
});
