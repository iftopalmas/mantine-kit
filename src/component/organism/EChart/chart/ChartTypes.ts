import { ChartType } from './ChartType';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { StackedBarChart } from './StackedBarChart';
import { DonutChart } from './DonutChart';

/**
 * Single instances of the chart types. The types have no state, so they can be shared by all screens.
 * @author Manoel Campos
 */

export const LINE_CHART = new LineChart();
export const BAR_CHART = new BarChart();
export const STACKED_BAR_CHART = new StackedBarChart();
export const DONUT_CHART = new DonutChart();

/** All chart types, in the order they appear in a chart type selector. */
export const CHART_TYPES: readonly ChartType[] = [BAR_CHART, LINE_CHART, STACKED_BAR_CHART, DONUT_CHART];
