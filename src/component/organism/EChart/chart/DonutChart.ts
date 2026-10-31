import type { EChartsOption } from 'echarts';

import { ChartData, ChartSeries, groupByStack } from './ChartSeries';
import { ChartContext, ChartType } from './ChartType';
import { ChartTypeId } from './ChartTypeId';
import { chartMessages } from './ChartTexts';
import { buildChartHeader, legendExtraHeight, tooltipFormatter } from './ChartHeader';

/**
 * Height of the donut chart with the legend in one row (px). It does not depend on the number of categories; it only
 * grows when the legend wraps in more rows.
 */
export const DONUT_HEIGHT = 520;

/** Inner and outer radius of the donut, relative to the area of the donut ({@link DONUT_HEIGHT} high). */
const DONUT_RADIUS = ['40%', '68%'];

/** Center of the donut: moved down so it is not under the title. */
const DONUT_CENTER = ['50%', '58%'];

/**
 * Donut chart: shows how the total of a stack ({@link ChartSeries#stack}) splits among its series in a single
 * category (e.g. "how the revenue splits by category in 2040").
 * It is available only when there is exactly one stack, none of its series has a negative value (negative slices make
 * no sense) and all series of the chart are in the stack or are its total ({@link ChartSeries#totalOf}).
 * So choosing the donut never stops showing, without warning, a series the user selected.
 * @author Manoel Campos
 */
export class DonutChart implements ChartType {
    readonly id: ChartTypeId = 'donut';
    readonly singleCategory = true;

    isAvailable(series: ChartSeries[]): boolean {
        const stacks = [...groupByStack(series).entries()];
        if (stacks.length !== 1) return false;

        const [stack, slicesSeries] = stacks[0];
        const belongsToStack = (serie: ChartSeries) => serie.stack === stack || serie.totalOf === stack;
        return series.every(belongsToStack) && slicesSeries.every(hasNoNegativeValues);
    }

    buildOption(data: ChartData, context: ChartContext): EChartsOption {
        const messages = chartMessages(context);
        const category = shownCategory(data.categories, context.category);
        const slices = buildSlices(data, context);
        const unit = stackSeries(data)[0]?.unit;
        const total = slices.reduce((sum, slice) => sum + slice.value, 0);
        const header = buildChartHeader(
            `${context.title} - ${category}`,
            slices.map(slice => slice.name),
            messages
        );

        return {
            ...header,
            title: { ...header.title, subtext: unit && messages.total(unit.format(total)) },
            // The legend goes to the bottom, so it is not under the subtitle with the total.
            legend: { ...header.legend, top: undefined, bottom: 0 },
            tooltip: { trigger: 'item', valueFormatter: unit && tooltipFormatter(unit) },
            series: [
                {
                    type: 'pie',
                    // The area of the donut is fixed at the top; the extra legend rows stay below it.
                    top: 0,
                    height: DONUT_HEIGHT,
                    radius: DONUT_RADIUS,
                    center: DONUT_CENTER,
                    data: slices,
                    label: { formatter: '{b}: {d}%' }
                }
            ]
        } as EChartsOption;
    }

    height(data: ChartData, context: ChartContext): number {
        return (
            DONUT_HEIGHT +
            legendExtraHeight(
                buildSlices(data, context).map(slice => slice.name),
                context.width
            )
        );
    }
}

/** Slice of the donut: the value of a series of the stack in the category shown. */
type Slice = { name: string; value: number };

/**
 * Returns the series of the only stack of the chart, which become the slices of the donut.
 * @param data series and categories of the chart
 * @return the series of the stack (empty if there is no stack)
 */
function stackSeries(data: ChartData): ChartSeries[] {
    return [...groupByStack(data.series).values()][0] ?? [];
}

/**
 * Builds the slices of the donut in the category shown, without the series that have no value in it.
 * @param data series and categories of the chart
 * @param context category chosen on the screen
 * @return a slice per series of the stack with a value in the category
 */
function buildSlices(data: ChartData, context: ChartContext): Slice[] {
    const categoryIndex = data.categories.indexOf(shownCategory(data.categories, context.category));
    return stackSeries(data)
        .map(serie => ({ name: serie.name, value: serie.values[categoryIndex] }))
        .filter((slice): slice is Slice => slice.value !== null);
}

/**
 * Checks whether a series has no negative values, which make no sense as slices.
 * @param serie series of a stack
 * @return true if the series has no negative value (categories without a value are ignored)
 */
function hasNoNegativeValues(serie: ChartSeries): boolean {
    return serie.values.every(value => value === null || value >= 0);
}

/**
 * Returns the category a single-category chart should show: the chosen one, if it is in the chart; otherwise, the last.
 * @template C type of the categories (e.g. the years, as numbers)
 * @param categories categories of the chart
 * @param chosen category chosen on the screen; absent if none was chosen
 * @return the category to show
 */
export function shownCategory<C extends string | number>(categories: C[], chosen?: C): C {
    return chosen !== undefined && categories.includes(chosen) ? chosen : categories[categories.length - 1];
}
