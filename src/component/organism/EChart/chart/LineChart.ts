import { ChartTypeId } from './ChartTypeId';
import { CartesianChart, CartesianSeries } from './CartesianChart';

/**
 * Line chart: shows the trend of each series along the categories.
 * Suited to rates and levels (e.g. percentages, coefficients, population).
 * @author Manoel Campos
 */
export class LineChart extends CartesianChart {
    readonly id: ChartTypeId = 'line';

    protected seriesStyle(): CartesianSeries {
        // connectNulls false: a category without a value is a gap in the line, instead of joining the neighbors.
        return { type: 'line', connectNulls: false };
    }
}
