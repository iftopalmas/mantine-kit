import { describe, expect, test } from '@jest/globals';
import type { EChartsOption, SeriesOption } from 'echarts';

import { groupByStack } from '@/src/component/organism/EChart/chart/ChartSeries';
import { ChartContext } from '@/src/component/organism/EChart/chart/ChartType';
import {
    BAR_CHART,
    CHART_TYPES,
    DONUT_CHART,
    LINE_CHART,
    STACKED_BAR_CHART
} from '@/src/component/organism/EChart/chart/ChartTypes';
import { NEGATIVE_VALUE_COLOR } from '@/src/component/organism/EChart/chart/BarChart';
import { DONUT_HEIGHT, shownCategory } from '@/src/component/organism/EChart/chart/DonutChart';
import { PANELS_TOP } from '@/src/component/organism/EChart/chart/UnitPanels';
import { enUS } from '@/src/i18n/messages/enUS';
import { ptBR } from '@/src/i18n/messages/ptBR';
import { chartData, PERCENT, series } from '@/__test__/component/organism/EChart/chart/ChartFixture';

const CONTEXT: ChartContext = { title: 'Title' };

const PART_A = series('A', [10, 20], undefined, 'stack');
const PART_B = series('B', [5, 6], undefined, 'stack');
const TOTAL = { ...series('Total', [15, 26]), totalOf: 'stack' };
const RATE = series('Rate', [10, 20], PERCENT);

/** ECharts series with the tooltip formatter the chart types define in each series. */
type SeriesWithTooltip = SeriesOption & { tooltip?: { valueFormatter: (v: unknown) => string } };

/**
 * Returns the series of an ECharts `option` as an array, to inspect them in the tests.
 * @param option built option
 * @return the series of the option
 */
function seriesOf(option: EChartsOption): SeriesWithTooltip[] {
    return option.series as SeriesWithTooltip[];
}

/**
 * Tests the chart types only with generic data, without any domain data: it shows that they depend on no domain.
 */
describe('ChartTypes', () => {
    test('groups in stacks only the ones with enough series', () => {
        const alone = series('C', [1, 1], undefined, 'other');
        expect([...groupByStack([PART_A, PART_B, alone, TOTAL]).keys()]).toEqual(['stack']);
    });

    test('line and columns work for any set of series, but not for an empty one', () => {
        expect(CHART_TYPES.filter(type => type.isAvailable([RATE])).map(type => type.id)).toEqual(['bar', 'line']);
        expect(CHART_TYPES.filter(type => type.isAvailable([]))).toEqual([]);
    });

    test('stacked columns and donut are available only with a stack', () => {
        expect(STACKED_BAR_CHART.isAvailable([PART_A, PART_B, TOTAL])).toBe(true);
        expect(DONUT_CHART.isAvailable([PART_A, PART_B, TOTAL])).toBe(true);
        expect(STACKED_BAR_CHART.isAvailable([PART_A, TOTAL])).toBe(false);
    });

    test('donut is unavailable with negative values or with more than one stack', () => {
        const negative = series('B', [-5, 6], undefined, 'stack');
        const otherStack = [series('C', [1, 1], undefined, 'other'), series('D', [1, 1], undefined, 'other')];

        expect(DONUT_CHART.isAvailable([PART_A, negative])).toBe(false);
        expect(DONUT_CHART.isAvailable([PART_A, PART_B, ...otherStack])).toBe(false);
    });

    // The donut draws only the stack: accepting a loose series would make it disappear from the chart without warning.
    test('donut accepts the total of the stack, but is unavailable with a series that is not in the stack', () => {
        expect(DONUT_CHART.isAvailable([PART_A, PART_B, TOTAL])).toBe(true);
        expect(DONUT_CHART.isAvailable([PART_A, PART_B, RATE])).toBe(false);
        expect(DONUT_CHART.isAvailable([PART_A, PART_B, { ...TOTAL, totalOf: 'other' }])).toBe(false);
    });

    test('columns highlight only the negative values', () => {
        const [bars] = seriesOf(BAR_CHART.buildOption(chartData(series('Balance', [-3, 4])), CONTEXT));

        expect(bars).toMatchObject({
            type: 'bar',
            data: [{ value: -3, itemStyle: { color: NEGATIVE_VALUE_COLOR } }, 4]
        });
    });

    test('stacked columns stack the series of a stack and draw the others as lines', () => {
        const chartSeries = seriesOf(STACKED_BAR_CHART.buildOption(chartData(PART_A, PART_B, TOTAL), CONTEXT));

        expect(chartSeries[0]).toMatchObject({ type: 'bar', stack: 'stack' });
        expect(chartSeries[1]).toMatchObject({ type: 'bar', stack: 'stack' });
        expect(chartSeries[2]).toMatchObject({ type: 'line' });
        expect(chartSeries[2]).not.toHaveProperty('stack');
    });

    test('each unit goes to its own panel and the tooltip formats with the unit of the series', () => {
        const [money, rate] = seriesOf(LINE_CHART.buildOption(chartData(TOTAL, RATE), CONTEXT));

        expect(money).toMatchObject({ xAxisIndex: 0, yAxisIndex: 0 });
        expect(rate).toMatchObject({ xAxisIndex: 1, yAxisIndex: 1 });
        expect(rate.tooltip?.valueFormatter(12.5)).toBe('12.5%');
        expect(rate.tooltip?.valueFormatter(null)).toBe('-');
    });

    test('donut shows the series of the stack in the chosen category, with the total in the subtitle', () => {
        const option = DONUT_CHART.buildOption(chartData(PART_A, PART_B, TOTAL), { title: 'T', category: 2025 });

        expect(seriesOf(option)[0]).toMatchObject({
            type: 'pie',
            data: [
                { name: 'A', value: 10 },
                { name: 'B', value: 5 }
            ]
        });
        expect(option.title).toMatchObject({ text: 'T - 2025', subtext: 'Total: $ 15' });
        expect(DONUT_CHART.height(chartData(PART_A, PART_B), CONTEXT)).toBe(DONUT_HEIGHT);
    });

    // ECharts reserves no room for the legend: without this, its extra rows would be over the chart.
    test('the height and the top of the panels grow when the legend wraps in more rows', () => {
        const data = chartData(PART_A, PART_B, TOTAL);
        // Too narrow for the items "A" and "B" (37px each, with the icon) to stay in the same row.
        const narrow = { ...CONTEXT, width: 60 };
        const option = BAR_CHART.buildOption(data, narrow);
        const [grid] = option.grid as { top: number }[];

        expect(BAR_CHART.height(data, narrow)).toBeGreaterThan(BAR_CHART.height(data, CONTEXT));
        expect(grid.top).toBeGreaterThan(PANELS_TOP);
        expect(DONUT_CHART.height(data, narrow)).toBeGreaterThan(DONUT_HEIGHT);
    });

    test('donut uses the last category when none was chosen', () => {
        expect(shownCategory([2025, 2026])).toBe(2026);
        expect(shownCategory([2025, 2026], 2030)).toBe(2026);
        expect(DONUT_CHART.buildOption(chartData(PART_A, PART_B), CONTEXT).title).toMatchObject({
            text: 'Title - 2026'
        });
    });

    test('the donut subtitle and the save image button follow the locale of the context', () => {
        const option = DONUT_CHART.buildOption(chartData(PART_A, PART_B), { title: 'T', locale: 'pt-BR' });
        const toolbox = option.toolbox as { feature: { saveAsImage: { title: string } } };

        expect(option.title).toMatchObject({ subtext: 'Total: $ 26' });
        expect(toolbox.feature.saveAsImage.title).toBe('Exportar imagem');
    });

    test('every chart type has a name in each locale', () => {
        CHART_TYPES.forEach(type => {
            expect(ptBR.chart.types[type.id]).toBeTruthy();
            expect(enUS.chart.types[type.id]).toBeTruthy();
        });
    });
});
