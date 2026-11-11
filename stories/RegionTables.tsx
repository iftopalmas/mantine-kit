import { ComponentProps, ReactElement } from 'react';

import Table from '@/src/component/organism/Table/Table';
import { useClientPagination } from '@/src/component/organism/Table/useClientPagination';
import { useServerPagination } from '@/src/component/organism/Table/useServerPagination';
import { ListDataSource } from '@/src/data/ListDataSource';
import { FetchPage } from '@/src/data/PageRequest';
import { Region } from './fixtures';

/*
Tables of regions for the stories, which create the `data` of the Table with the pagination hooks, as an app does.
Story args cannot call hooks, so the stories render these components.
*/

/** Props of the Table, except `data`, which the components below create. */
export type RegionTableProps = Omit<ComponentProps<typeof Table<Region, ListDataSource<Region>>>, 'data'>;

/** Table of regions sorted and paginated in the browser. */
export function ClientRegionTable({
    fetchAll,
    pagination,
    ...props
}: RegionTableProps & { fetchAll: () => Promise<Region[]>; pagination?: boolean }): ReactElement {
    const data = useClientPagination(fetchAll, { pagination });

    return <Table {...props} data={data} />;
}

/** Table of regions sorted and paginated by the (simulated) backend. */
export function ServerRegionTable({
    fetchPage,
    ...props
}: RegionTableProps & { fetchPage: FetchPage<Region> }): ReactElement {
    const data = useServerPagination(fetchPage);

    return <Table {...props} data={data} />;
}

/** Columns of the region tables. */
export const REGION_COLUMNS: RegionTableProps['columns'] = [
    { accessor: 'name', title: 'Name', sortable: true },
    { accessor: 'cities', title: 'Cities', sortable: true }
];
