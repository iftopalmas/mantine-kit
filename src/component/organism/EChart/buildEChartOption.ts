import type { EChartsOption, SeriesOption } from 'echarts';

import { DEFAULT_OPTION, DEFAULT_VISUAL_MAP } from './echartDefaults';
import { mergeDeep } from '../../../util/ObjectUtil';

/**
 * Value of an element of the chart. `null`/`undefined` mean an absent value, which ECharts shows as empty (e.g. a
 * city without a computed index).
 */
export type EChartValue = number | null | undefined;

/** Element of a series, in the format ECharts expects in `series[i].data`. */
export type EChartDataItem = { name: string; value: EChartValue };

/**
 * Functions that extract from a domain item what ECharts needs to show it.
 * They are used by the {@link EChart}, so whoever uses it gives the raw data, without building the series by hand.
 */
export type EChartDataAccessors<T> = {
    /** Returns the name of the element in the chart (e.g. the code of a city, which links the data to the map area). */
    getName: (item: T) => string;

    /** Returns the value of the element in the chart. */
    getValue: (item: T) => EChartValue;
};

/**
 * Converts the domain data to the `{ name, value }[]` format used in the ECharts series.
 * @param data raw domain data
 * @param accessors functions that extract the name and the value of each item
 * @return an element `{ name, value }` for each item of `data`, in the same order
 */
export function toEChartData<T>(data: T[], { getName, getValue }: EChartDataAccessors<T>): EChartDataItem[] {
    return data.map(item => ({ name: getName(item), value: getValue(item) }));
}

/**
 * Fills the `data` of the series that define no data of their own. Series that already have `data` are kept as they are.
 * @param series single series or array of series, as accepted by the ECharts `option.series`
 * @param chartData data to use in the series
 * @return the series in the same format received (single object or array), or `undefined` if there are no series
 */
function fillSeriesData(series: EChartsOption['series'], chartData: EChartDataItem[]): EChartsOption['series'] {
    const fill = (serie: SeriesOption): SeriesOption =>
        'data' in serie && serie.data !== undefined ? serie : ({ ...serie, data: chartData } as SeriesOption);

    if (series === undefined) return undefined;

    return Array.isArray(series) ? series.map(fill) : fill(series);
}

/**
 * Builds the final `option` of a chart, applying the default values and the domain data.
 * The attributes of `option` replace the corresponding defaults (deep merge).
 * @param data raw domain data
 * @param accessors functions that extract the name and the value of each item
 * @param option options specific to the chart
 * @param withVisualMap whether the elements should be colored according to their percentage value (0..1), with the
 *        gradient legend of the {@link DEFAULT_VISUAL_MAP}. Use `false` in charts of absolute values.
 * @param saveAsImageTitle title of the button that saves the chart as an image, in the language of the user
 * @return the `option` ready to be given to the ECharts `setOption`
 */
export function buildEChartOption<T>(
    data: T[],
    accessors: EChartDataAccessors<T>,
    option: EChartsOption = {},
    withVisualMap: boolean = true,
    saveAsImageTitle?: string
): EChartsOption {
    const defaultOption: EChartsOption = saveAsImageTitle
        ? mergeDeep(DEFAULT_OPTION, { toolbox: { feature: { saveAsImage: { title: saveAsImageTitle } } } })
        : DEFAULT_OPTION;
    const defaults: EChartsOption = withVisualMap ? { ...defaultOption, visualMap: DEFAULT_VISUAL_MAP } : defaultOption;
    const mergedOption = mergeDeep(defaults, option);
    const series = fillSeriesData(mergedOption.series, toEChartData(data, accessors));

    /* Without series in the option, there is nowhere to put the data: returns the option as it is, without creating
       `series: undefined`. With series, returns a copy of the option whose series are the ones that received `data`. */
    return series === undefined ? mergedOption : { ...mergedOption, series };
}
