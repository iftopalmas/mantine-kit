import type { Meta, StoryObj } from '@storybook/react-vite';

import { EChart } from '@/src/component/organism/EChart/EChart';
import { ChartData } from '@/src/component/organism/EChart/chart/ChartSeries';
import { CHART_TYPES } from '@/src/component/organism/EChart/chart/ChartTypes';
import { ChartTypeId } from '@/src/component/organism/EChart/chart/ChartTypeId';
import { useKitConfig } from '@/src/provider/useKit';

/** Formats a value as money. */
const money = { label: '$', format: (value: number) => `$ ${value.toLocaleString('en-US')}` };

/** Revenue split by product (a stack), with its total and a percentage series in another unit. */
const DATA: ChartData = {
    categories: [2024, 2025, 2026, 2027, 2028],
    series: [
        { id: 'water', name: 'Water', values: [120, 135, 150, 162, 170], unit: money, stack: 'revenue' },
        { id: 'sewage', name: 'Sewage', values: [60, 72, 80, 95, 110], unit: money, stack: 'revenue' },
        { id: 'total', name: 'Total', values: [180, 207, 230, 257, 280], unit: money, totalOf: 'revenue' },
        {
            id: 'growth',
            name: 'Growth',
            values: [null, 15, 11.1, 11.7, 8.9],
            unit: { label: '%', format: value => `${value.toFixed(1)}%` }
        }
    ]
};

/** Data accepted by the donut: only the stack and its total. */
const STACK_DATA: ChartData = { ...DATA, series: DATA.series.filter(serie => serie.stack || serie.totalOf) };

type Props = { type: ChartTypeId };

/** Chart of one of the chart types, with the texts of the locale of the toolbar. */
function Chart({ type }: Props): React.ReactElement {
    const { locale, messages } = useKitConfig();
    const chartType = CHART_TYPES.find(candidate => candidate.id === type)!;
    const data = chartType.isAvailable(DATA.series) ? DATA : STACK_DATA;
    const context = { title: messages.chart.types[type], locale };

    return (
        <EChart
            data={[]}
            getName={() => ''}
            getValue={() => null}
            option={chartType.buildOption(data, context)}
            withVisualMap={false}
            style={{ height: chartType.height(data, context) }}
        />
    );
}

const meta = {
    title: 'Organisms/EChart',
    component: Chart,
    argTypes: { type: { control: 'select', options: CHART_TYPES.map(type => type.id) } },
    args: { type: 'bar' }
} satisfies Meta<typeof Chart>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Columns, with one panel per unit ($ and %). */
export const Bar: Story = {};

export const Line: Story = { args: { type: 'line' } };

/** The series of the stack are stacked and the total becomes a line. */
export const StackedBar: Story = { args: { type: 'stacked-bar' } };

/** How the total of the stack splits in the last year. */
export const Donut: Story = { args: { type: 'donut' } };

/** The `EChart` itself, with a raw ECharts option and the data filled from domain items. */
export const RawOption: StoryObj<typeof EChart<{ name: string; share: number }>> = {
    render: () => (
        <EChart
            data={[
                { name: 'North', share: 0.82 },
                { name: 'South', share: 0.64 },
                { name: 'Center', share: 0.91 }
            ]}
            getName={item => item.name}
            getValue={item => item.share}
            option={{
                xAxis: { type: 'category', data: ['North', 'South', 'Center'] },
                yAxis: {},
                series: [{ type: 'bar' }]
            }}
            style={{ height: 360 }}
        />
    )
};
