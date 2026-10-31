import { ChartSeries, groupByStack } from './ChartSeries';
import { ChartTypeId } from './ChartTypeId';
import { CartesianChart, CartesianSeries } from './CartesianChart';

/**
 * Stacked column chart with lines: the series of the same stack ({@link ChartSeries#stack}) are stacked, showing how
 * much each one contributes to each category, and the other series (such as a total) become lines over the columns.
 * It is available only when there is a stack with enough series (see `groupByStack`). Whoever builds the series
 * decides which ones can be stacked, so series whose sum makes no sense are never stacked.
 * @author Manoel Campos
 */
export class StackedBarChart extends CartesianChart {
    readonly id: ChartTypeId = 'stacked-bar';

    isAvailable(series: ChartSeries[]): boolean {
        return groupByStack(series).size > 0;
    }

    protected seriesStyle(serie: ChartSeries, all: ChartSeries[]): CartesianSeries {
        // A series with a stack, but alone in it, has nothing to be stacked with: it becomes a line.
        if (!serie.stack || !groupByStack(all).has(serie.stack)) return { type: 'line', connectNulls: false };

        // Each stack is stacked separately, so series of different wholes are not added up.
        return { type: 'bar', stack: serie.stack };
    }
}
