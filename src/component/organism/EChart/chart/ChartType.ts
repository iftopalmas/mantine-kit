import type { EChartsOption } from 'echarts';

import { KitLocale } from '../../../../i18n/KitLocale';
import { ChartMessages } from '../../../../i18n/KitMessages';
import { ChartData, ChartSeries } from './ChartSeries';
import { ChartTypeId } from './ChartTypeId';

/**
 * Contract every chart type must follow (Strategy pattern). Each type builds the ECharts `option` from generic data
 * ({@link ChartData}), depending on no domain. The name of each type, shown to the user, is in the texts of the
 * locale (`chart.types[id]`).
 * @author Manoel Campos
 */

export type { ChartTypeId };

/** Information of the screen that affects how the chart is built, besides the data. */
export type ChartContext = {
    /** Title shown in the chart (and in the saved image). */
    title: string;

    /** Category shown by the types that show a single category (e.g. the year of the donut); absent for the last one. */
    category?: string | number;

    /** Width of the chart (px), used to know in how many rows the legend wraps; absent while unknown. */
    width?: number;

    /** Locale of the texts and of the number format of the chart. Default: `en-US`. */
    locale?: KitLocale;

    /** Texts that replace the ones of the locale (e.g. the ones the app overrides in the `KitProvider`). */
    messages?: Partial<ChartMessages>;
};

export interface ChartType {
    readonly id: ChartTypeId;

    /** Whether the type shows a single category (so the screen should show a category selector, such as the year). */
    readonly singleCategory: boolean;

    /**
     * Tells whether the type makes sense for the series. The screen should offer only the available types.
     * @param series series of the chart
     * @return true if the type can be used for the series
     */
    isAvailable(series: ChartSeries[]): boolean;

    /**
     * Builds the ECharts `option`, which is given to the `EChart` component.
     * @param data series and categories of the chart
     * @param context title, category, locale and texts
     * @return the `option` of the chart
     */
    buildOption(data: ChartData, context: ChartContext): EChartsOption;

    /**
     * Computes the height the chart needs.
     * @param data series and categories of the chart
     * @param context width of the chart, which defines how many rows the legend takes
     * @return the height of the chart (px)
     */
    height(data: ChartData, context: ChartContext): number;
}
