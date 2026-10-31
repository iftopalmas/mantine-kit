import type { EChartsOption } from 'echarts';

import { DEFAULT_LOCALE } from '../../../../i18n/KitLocale';
import { ChartSeries, ChartUnit } from './ChartSeries';

/**
 * Splits the series of a chart into panels, one per unit, stacked vertically and sharing the same X axis of
 * categories (small multiples). So series with different units (e.g. $ and %) never share the same Y axis, and each
 * panel shows its unit in the name of the axis, without repeating the unit in the legend.
 * @author Manoel Campos
 */

/** Series of the same unit, drawn in the same panel. */
export type Panel = {
    unit: ChartUnit;
    series: ChartSeries[];
};

/** Room at the top of the chart, for the title and one legend row (px). */
export const PANELS_TOP = 100;

/** Height of each panel (px). */
export const PANEL_HEIGHT = 280;

/** Space between a panel and the next one, where the category labels of the upper panel are (px). */
export const PANEL_GAP = 60;

/** Room below the last panel, for the category labels (px). */
export const BOTTOM_MARGIN = 40;

/** Extra height for the zoom bar of the X axis, when it is shown (px). */
export const ZOOM_HEIGHT = 50;

/** Side margins of the panels (px). The left one is wider to fit the values of the Y axis. */
const LEFT_MARGIN = 80;
const RIGHT_MARGIN = 40;

/** From how many categories the X axis gets a zoom bar, so the columns are not squeezed. */
export const MIN_CATEGORIES_FOR_ZOOM = 16;

/** Compact number formatters already created, by locale. */
const compactFormatters = new Map<string, Intl.NumberFormat>();

/**
 * Formats a number in a compact way (e.g. 1,250,000 → "1.3M" in `en-US`, "1,3 mi" in `pt-BR`), so the axes are not
 * cluttered. The full value stays in the tooltip.
 * @param value value to format
 * @param locale locale of the format; defaults to `en-US`
 * @return the value in the compact format of the locale
 */
export function formatCompactNumber(value: number, locale: string = DEFAULT_LOCALE): string {
    let formatter = compactFormatters.get(locale);
    if (!formatter) {
        formatter = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
        compactFormatters.set(locale, formatter);
    }

    return formatter.format(value);
}

/**
 * Groups the series by the label of the unit, in the order each unit first appears.
 * @param series series of the chart
 * @return a panel per unit
 */
export function groupByUnit(series: ChartSeries[]): Panel[] {
    const panels = new Map<string, Panel>();
    series.forEach(serie => {
        const panel = panels.get(serie.unit.label) ?? { unit: serie.unit, series: [] };
        panel.series.push(serie);
        panels.set(serie.unit.label, panel);
    });

    return Array.from(panels.values());
}

/**
 * Checks whether the X axis needs a zoom bar, so many categories are not squeezed.
 * @param categoriesCount number of categories in the X axis
 * @return true if the X axis should have a zoom bar
 */
export function needsZoom(categoriesCount: number): boolean {
    return categoriesCount >= MIN_CATEGORIES_FOR_ZOOM;
}

/**
 * Computes the total height of the chart, which grows with the number of panels.
 * @param panelsCount number of panels (different units)
 * @param categoriesCount number of categories in the X axis, which defines whether there is a zoom bar
 * @param extraTop extra room at the top, besides {@link PANELS_TOP}, for the extra rows of the legend (px)
 * @return the height of the chart (px)
 */
export function panelsHeight(panelsCount: number, categoriesCount: number, extraTop: number = 0): number {
    const panels = panelsCount * PANEL_HEIGHT + Math.max(panelsCount - 1, 0) * PANEL_GAP;
    const zoom = needsZoom(categoriesCount) ? ZOOM_HEIGHT : 0;
    return PANELS_TOP + extraTop + panels + BOTTOM_MARGIN + zoom;
}

/**
 * Builds the grids and the axes of each panel. Panel `i` uses the grid, the X axis and the Y axis of index `i`.
 * The pointers of the X axes are linked, so hovering a category highlights it in all panels.
 * @param panels panels of the chart
 * @param categories categories of the X axis
 * @param extraTop extra room at the top, besides {@link PANELS_TOP}, for the extra rows of the legend (px)
 * @param locale locale of the number format of the Y axes; defaults to `en-US`
 * @return the parts of the ECharts `option` of the layout of the panels
 */
export function buildPanelAxes(
    panels: Panel[],
    categories: (string | number)[],
    extraTop: number = 0,
    locale: string = DEFAULT_LOCALE
): Pick<EChartsOption, 'grid' | 'xAxis' | 'yAxis' | 'dataZoom' | 'axisPointer'> {
    const indexes = panels.map((_, index) => index);
    const categoryLabels = categories.map(String);

    return {
        grid: indexes.map(index => ({
            top: PANELS_TOP + extraTop + index * (PANEL_HEIGHT + PANEL_GAP),
            height: PANEL_HEIGHT,
            left: LEFT_MARGIN,
            right: RIGHT_MARGIN
        })),
        xAxis: indexes.map(index => ({ type: 'category', gridIndex: index, data: categoryLabels })),
        yAxis: panels.map((panel, index) => ({
            type: 'value',
            gridIndex: index,
            name: panel.unit.label,
            axisLabel: { formatter: (value: number) => formatCompactNumber(value, locale) }
        })),
        dataZoom: needsZoom(categories.length) ? buildZoom(indexes) : [],
        axisPointer: { link: [{ xAxisIndex: 'all' }] }
    };
}

/**
 * Creates the zoom bar (and the zoom by the mouse wheel) applied to all X axes at once.
 * @param xAxisIndexes indexes of the X axes of the panels
 * @return the ECharts `dataZoom` configuration
 */
function buildZoom(xAxisIndexes: number[]): EChartsOption['dataZoom'] {
    return [
        { type: 'slider', xAxisIndex: xAxisIndexes, bottom: BOTTOM_MARGIN / 4 },
        { type: 'inside', xAxisIndex: xAxisIndexes }
    ];
}
