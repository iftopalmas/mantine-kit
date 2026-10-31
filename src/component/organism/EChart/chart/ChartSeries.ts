/**
 * Generic data of a chart with a category axis (e.g. years), independent of any domain.
 * Each app converts its data to these types and chooses a `ChartType` to build the ECharts `option`.
 * @author Manoel Campos
 */

/** Minimum number of series in a stack for stacking them (or splitting them in a donut) to make sense. */
export const MIN_STACK_SIZE = 2;

/** Unit of the values of a series: how it appears in the axis and how each value is formatted. */
export type ChartUnit = {
    /** Label of the unit, shown as the name of the Y axis (e.g. "$", "m³/year"). Series with the same label share the axis. */
    label: string;

    /**
     * Formats a value of the series for the tooltip and for the total of the donut.
     * @param value value of the series
     * @return the formatted value, with the suffix of the unit, if any
     */
    format: (value: number) => string;
};

/** Values of a series along the categories of the chart. */
export type ChartSeries = {
    /** Identifies the series uniquely in the chart. */
    id: string;

    /** Name shown in the legend and in the tooltip (it must be unique in the chart). */
    name: string;

    /** One value per category, in the order of {@link ChartData#categories}; `null` when there is no value. */
    values: (number | null)[];

    unit: ChartUnit;

    /**
     * Key of the stack of the series. Series with the same key are parts of the same whole and can be stacked (or
     * shown as slices of a donut). Absent when the series cannot be stacked (e.g. a total).
     */
    stack?: string;

    /**
     * Key of the stack whose total (the sum of the series of the stack) this series is. Absent when the series is not
     * the total of a stack. It allows the donut to accept the total (already shown as the subtitle) without silently
     * dropping other series.
     */
    totalOf?: string;
};

/** Series of a chart and the categories of the X axis (e.g. years), to which the values of the series are aligned. */
export type ChartData = {
    categories: (string | number)[];
    series: ChartSeries[];
};

/**
 * Groups the series by the stack they belong to.
 * @param series series of the chart
 * @return the series of each stack with at least {@link MIN_STACK_SIZE} series, indexed by the key of the stack
 */
export function groupByStack(series: ChartSeries[]): Map<string, ChartSeries[]> {
    const stacks = new Map<string, ChartSeries[]>();
    series.forEach(serie => serie.stack && stacks.set(serie.stack, [...(stacks.get(serie.stack) ?? []), serie]));

    stacks.forEach((stackSeries, stack) => stackSeries.length < MIN_STACK_SIZE && stacks.delete(stack));
    return stacks;
}
