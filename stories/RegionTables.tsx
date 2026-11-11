import { ComponentProps, ReactElement } from 'react';

import Table from '@/src/component/organism/Table/Table';
import { FetchAll, useClientPagination } from '@/src/component/organism/Table/useClientPagination';
import { useServerPagination } from '@/src/component/organism/Table/useServerPagination';
import { ListDataSource } from '@/src/data/ListDataSource';
import { PageDataSource } from '@/src/data/PageDataSource';
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
    source,
    pagination,
    ...props
}: RegionTableProps & { source: ListDataSource<Region> | FetchAll<Region>; pagination?: boolean }): ReactElement {
    const data = useClientPagination(source, { pagination });

    return <Table {...props} data={data} />;
}

/** Table of regions sorted and paginated by the (simulated) backend. */
export function ServerRegionTable({
    source,
    ...props
}: RegionTableProps & { source: PageDataSource<Region> | FetchPage<Region> }): ReactElement {
    const data = useServerPagination(source);

    return <Table {...props} data={data} />;
}

/** Columns of the region tables. */
export const REGION_COLUMNS: RegionTableProps['columns'] = [
    { accessor: 'name', title: 'Name', sortable: true },
    { accessor: 'cities', title: 'Cities', sortable: true }
];
