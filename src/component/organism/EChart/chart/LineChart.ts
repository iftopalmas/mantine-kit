import { IconChartLine, type Icon } from '@tabler/icons-react';

import { ChartTypeId } from './ChartTypeId';
import { CartesianChart, CartesianSeries } from './CartesianChart';

/**
 * Line chart: shows the trend of each series along the categories.
 * Suited to rates and levels (e.g. percentages, coefficients, population).
 * @author Manoel Campos
 */
export class LineChart extends CartesianChart {
    readonly id: ChartTypeId = 'line';

    /** @param icon icon that replaces the default one */
    constructor(icon: Icon = IconChartLine) {
        super(icon);
    }

    protected seriesStyle(): CartesianSeries {
        // connectNulls false: a category without a value is a gap in the line, instead of joining the neighbors.
        return { type: 'line', connectNulls: false };
    }
}
