import { ChartSeries } from './ChartSeries';
import { ChartTypeId } from './ChartTypeId';
import { CartesianChart, CartesianSeries, DataPoint } from './CartesianChart';

/** Color of the columns with a negative value (e.g. a deficit), to set them apart from the positive ones. */
export const NEGATIVE_VALUE_COLOR = '#d9480f';

/**
 * Grouped column chart: compares the series category by category.
 * Suited to flows (e.g. yearly values) and to balances that may be negative (deficit/surplus): the negative columns
 * get the {@link NEGATIVE_VALUE_COLOR}, without changing the color of the series in the legend.
 * @author Manoel Campos
 */
export class BarChart extends CartesianChart {
    readonly id: ChartTypeId = 'bar';

    protected seriesStyle(): CartesianSeries {
        return { type: 'bar' };
    }

    protected seriesData(serie: ChartSeries): DataPoint[] {
        return highlightNegativeValues(serie.values);
    }
}

/**
 * Gives the {@link NEGATIVE_VALUE_COLOR} only to the negative values. The others keep the color of the series.
 * @param values values of a series
 * @return the values in the `series[i].data` format, with their own style in the negative ones
 */
export function highlightNegativeValues(values: (number | null)[]): DataPoint[] {
    return values.map(value =>
        value !== null && value < 0 ? { value, itemStyle: { color: NEGATIVE_VALUE_COLOR } } : value
    );
}
