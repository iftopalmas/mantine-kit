import type { EChartsOption } from 'echarts';

import { ChartMessages } from '../../../../i18n/KitMessages';
import { DEFAULT_MESSAGES } from '../../../../i18n/resolveMessages';
import { ChartUnit } from './ChartSeries';

/**
 * Parts of the `option` shared by all chart types: title, legend, image export and tooltip format.
 * @author Manoel Campos
 */

/** Distance from the legend to the top of the chart, just below the title (px). */
const LEGEND_TOP = 40;

/*
 * Measures of the ECharts legend (its default values), used to estimate in how many rows it wraps.
 * ECharts reserves no room for the rows of the legend: whatever is drawn below it needs to know its height.
 */

/** Font of the names in the legend (default ECharts size and family). */
const LEGEND_FONT = '12px sans-serif';

/** Width of the icon of each legend item plus the space until the name (px). */
const LEGEND_ICON_WIDTH = 25 + 5;

/** Space between the legend items, in the same row and between rows (px). */
const LEGEND_ITEM_GAP = 8;

/** Inner padding of the legend on each side (px). */
const LEGEND_PADDING = 5;

/** Height of each legend row, including the space until the next one (px). */
export const LEGEND_ROW_HEIGHT = 14 + LEGEND_ITEM_GAP;

/** Average width of a character of the {@link LEGEND_FONT}, used when the text cannot be measured (px). */
const AVERAGE_CHAR_WIDTH = 7;

/** Text shown in the tooltip when the series has no value in the category. */
const MISSING_VALUE = '-';

/**
 * Builds the title, the legend and the image export button.
 * The title also appears in the saved image, so it has context outside the screen.
 * @param title title of the chart
 * @param names names of the series, shown in the legend
 * @param messages texts of the chart; defaults to the one of the default locales
 * @return the parts of the `option` of the header
 */
export function buildChartHeader(
    title: string,
    names: string[],
    messages: ChartMessages = DEFAULT_MESSAGES.chart
): Pick<EChartsOption, 'title' | 'legend' | 'toolbox'> {
    return {
        title: { text: title, left: 'left' },
        // 'plain' wraps the legend in rows, instead of scrolling horizontally with arrows.
        legend: { type: 'plain', top: LEGEND_TOP, data: names },
        toolbox: { feature: { saveAsImage: { title: messages.saveAsImage, name: title } } }
    };
}

/**
 * Creates the function that formats a value in the tooltip with the unit of the series.
 * @param unit unit of the series
 * @return a function that formats the value received from ECharts (or "-" when the category has no value)
 */
export function tooltipFormatter(unit: ChartUnit): (value: unknown) => string {
    return value => (typeof value === 'number' ? unit.format(value) : MISSING_VALUE);
}

/**
 * Computes the extra height the legend takes when it wraps in more than one row, so the chart is moved down and is
 * not drawn under it.
 * @param names names of the series, shown in the legend
 * @param width width of the chart (px); absent while unknown, considering the legend in one row
 * @return the height of the legend rows beyond the first one (px)
 */
export function legendExtraHeight(names: string[], width?: number): number {
    return (legendRows(names, width) - 1) * LEGEND_ROW_HEIGHT;
}

/**
 * Estimates in how many rows the legend wraps, placing the items as ECharts does: from left to right, moving to the
 * next row when the next item does not fit.
 * @param names names of the series, shown in the legend
 * @param width width of the chart (px); absent while unknown
 * @return the number of rows of the legend (at least 1)
 */
export function legendRows(names: string[], width?: number): number {
    if (!width) return 1;

    const maxWidth = width - 2 * LEGEND_PADDING;
    let rows = 1;
    let rowWidth = 0;
    names.forEach(name => {
        const itemWidth = LEGEND_ICON_WIDTH + textWidth(name);
        const widthWithItem = rowWidth + LEGEND_ITEM_GAP + itemWidth;
        // The first item of a row always stays in it, even if it is wider than the chart.
        if (rowWidth === 0 || widthWithItem <= maxWidth) {
            rowWidth = rowWidth === 0 ? itemWidth : widthWithItem;
            return;
        }

        rows++;
        rowWidth = itemWidth;
    });

    return rows;
}

/** 2D context used only to measure texts; `null` where there is no canvas (server rendering, tests). */
let measureContext: OffscreenCanvasRenderingContext2D | null | undefined;

/**
 * Measures the width of a text in the font of the legend. Without a canvas, estimates it from the number of characters.
 * @param text text to measure
 * @return the width of the text (px)
 */
function textWidth(text: string): number {
    if (measureContext === undefined) {
        measureContext = typeof OffscreenCanvas === 'undefined' ? null : new OffscreenCanvas(1, 1).getContext('2d');
        if (measureContext) measureContext.font = LEGEND_FONT;
    }

    return measureContext ? measureContext.measureText(text).width : text.length * AVERAGE_CHAR_WIDTH;
}
