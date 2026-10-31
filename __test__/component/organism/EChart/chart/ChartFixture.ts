import { ChartData, ChartSeries, ChartUnit } from '@/src/component/organism/EChart/chart/ChartSeries';

/**
 * Test data for the generic chart types. It uses nothing of any domain: the chart types must work with this data alone.
 * @author Manoel Campos
 */

/** Test categories of the X axis. */
export const CATEGORIES = [2025, 2026];

/** Test money unit: formats with "$" in front. */
export const MONEY: ChartUnit = { label: '$', format: value => `$ ${value}` };

/** Test percentage unit: formats with "%" at the end. */
export const PERCENT: ChartUnit = { label: '%', format: value => `${value}%` };

/**
 * Creates a test series.
 * @param id id of the series (also used as the name)
 * @param values values of the series, one per category
 * @param unit unit of the series
 * @param stack stack of the series; absent if it cannot be stacked
 * @return the test series
 */
export function series(id: string, values: (number | null)[], unit: ChartUnit = MONEY, stack?: string): ChartSeries {
    return { id, name: id, values, unit, stack };
}

/**
 * Returns the data of a test chart with the given series and the test {@link CATEGORIES}.
 * @param chartSeries series of the chart
 * @return the data of the test chart
 */
export function chartData(...chartSeries: ChartSeries[]): ChartData {
    return { categories: CATEGORIES, series: chartSeries };
}
