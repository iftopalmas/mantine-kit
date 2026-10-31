import type { BarSeriesOption, EChartsOption, LineSeriesOption } from 'echarts';

import { ChartData, ChartSeries } from './ChartSeries';
import { ChartContext, ChartType } from './ChartType';
import { ChartTypeId } from './ChartTypeId';
import { chartLocale, chartMessages } from './ChartTexts';
import { buildPanelAxes, groupByUnit, panelsHeight } from './UnitPanels';
import { buildChartHeader, legendExtraHeight, tooltipFormatter } from './ChartHeader';

/** Column or line series, the two formats used in the charts with axes (cartesian). */
export type CartesianSeries = BarSeriesOption | LineSeriesOption;

/** Value of a category in a series, in the format accepted by `series[i].data` (with or without its own style). */
export type DataPoint = number | null | { value: number; itemStyle: { color: string } };

/**
 * Base of the chart types with an X axis of categories (line, columns, stacked columns).
 * It builds the panels per unit, the header and the tooltip, leaving to each type just the style of each series.
 * @author Manoel Campos
 */
export abstract class CartesianChart implements ChartType {
    abstract readonly id: ChartTypeId;
    readonly singleCategory = false;

    /** Types with axes work for any set of series, except the ones that restrict it (see the subclasses). */
    isAvailable(series: ChartSeries[]): boolean {
        return series.length > 0;
    }

    buildOption(data: ChartData, context: ChartContext): EChartsOption {
        const panels = groupByUnit(data.series);
        const series = panels.flatMap((panel, index) =>
            panel.series.map(serie => this.buildSeries(serie, data.series, index))
        );
        const names = data.series.map(serie => serie.name);
        const extraTop = legendExtraHeight(names, context.width);

        return {
            ...buildChartHeader(context.title, names, chartMessages(context)),
            tooltip: { trigger: 'axis' },
            ...buildPanelAxes(panels, data.categories, extraTop, chartLocale(context)),
            series
        };
    }

    height(data: ChartData, context: ChartContext): number {
        const extraTop = legendExtraHeight(
            data.series.map(serie => serie.name),
            context.width
        );
        return panelsHeight(groupByUnit(data.series).length, data.categories.length, extraTop);
    }

    /**
     * Defines how a series is drawn (type, stacking etc.).
     * @param serie series to draw
     * @param all all series of the chart, for types that depend on the whole set (e.g. stacking)
     * @return the style of the series in the ECharts format, without name, data and axes (filled by the base)
     */
    protected abstract seriesStyle(serie: ChartSeries, all: ChartSeries[]): CartesianSeries;

    /**
     * Values of the series in the `series[i].data` format. By default, the values themselves; subclasses may give
     * their own style to some values (e.g. negative values).
     * @param serie series of the chart
     * @return one value per category
     */
    protected seriesData(serie: ChartSeries): DataPoint[] {
        return serie.values;
    }

    /**
     * Creates the complete ECharts series: style of the type, name, values, axes of the panel and tooltip format.
     * @param serie series of the chart
     * @param all all series of the chart
     * @param panelIndex index of the panel (and of the axes) of the unit of the series
     * @return the series in the ECharts format
     */
    private buildSeries(serie: ChartSeries, all: ChartSeries[], panelIndex: number): CartesianSeries {
        return {
            ...this.seriesStyle(serie, all),
            id: serie.id,
            name: serie.name,
            data: this.seriesData(serie),
            xAxisIndex: panelIndex,
            yAxisIndex: panelIndex,
            tooltip: { valueFormatter: tooltipFormatter(serie.unit) }
        } as CartesianSeries;
    }
}
