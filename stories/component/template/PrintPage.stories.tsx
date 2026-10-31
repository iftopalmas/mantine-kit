import type { Meta, StoryObj } from '@storybook/react-vite';

import { Table } from '@mantine/core';

import PrintSection from '@/src/component/molecule/PrintSection/PrintSection';
import PrintPage from '@/src/component/template/PrintPage/PrintPage';
import { REGIONS } from '../../fixtures';

/** Table of the sample regions, as printed in a report. */
const regionsTable = (
    <Table withTableBorder>
        <Table.Thead>
            <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Cities</Table.Th>
            </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
            {REGIONS.map(region => (
                <Table.Tr key={region.id}>
                    <Table.Td>{region.name}</Table.Td>
                    <Table.Td>{region.cities}</Table.Td>
                </Table.Tr>
            ))}
        </Table.Tbody>
    </Table>
);

const meta = {
    title: 'Templates/PrintPage',
    component: PrintPage,
    parameters: { layout: 'fullscreen' },
    args: {
        title: 'Regions report',
        systemName: 'My System',
        info: [
            { label: 'Period', value: '2026 to 2030' },
            { label: 'Filter', value: 'All regions' }
        ],
        children: (
            <>
                <PrintSection title="Regions">{regionsTable}</PrintSection>
                <PrintSection title="Summary" newPage>
                    {`${REGIONS.length} regions`}
                </PrintSection>
            </>
        )
    }
} satisfies Meta<typeof PrintPage>;

export default meta;

/** Use the button (or Ctrl+P) to see the printed version. */
export const Portrait: StoryObj<typeof meta> = {};

export const Landscape: StoryObj<typeof meta> = { args: { orientation: 'landscape' } };
