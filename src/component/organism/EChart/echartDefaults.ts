import { CSSProperties } from 'react';

import type { EChartsOption, ToolboxComponentOption, TooltipComponentOption, VisualMapComponentOption } from 'echarts';

/** Shows the tooltip when hovering each element (map area, bar, slice etc.). */
export const DEFAULT_TOOLTIP: TooltipComponentOption = { trigger: 'item' };

/**
 * Pixel density of the image saved by the "save as image" button.
 * 3x gives a high resolution image, suited to printed reports.
 */
export const SAVE_IMAGE_PIXEL_RATIO = 3;

/** Adds to the chart the button that saves it as a high resolution image. */
export const DEFAULT_TOOLBOX: ToolboxComponentOption = {
    feature: { saveAsImage: { pixelRatio: SAVE_IMAGE_PIXEL_RATIO } }
};

/** Color of the lowest values of the scale of the {@link DEFAULT_VISUAL_MAP}. */
export const VISUAL_MAP_MIN_COLOR = '#e0f3f8';

/** Color of the highest values of the scale of the {@link DEFAULT_VISUAL_MAP}. */
export const VISUAL_MAP_MAX_COLOR = '#08589e';

/**
 * Color scale (the ECharts `visualMap` component) that paints each element of the chart (map area, bar etc.)
 * according to its value, in a gradient from {@link VISUAL_MAP_MIN_COLOR} (value 0) to {@link VISUAL_MAP_MAX_COLOR}
 * (value 1). It also shows a legend bar with this gradient, labeled from "0%" to "100%", with handles the user can drag
 * to highlight only the elements within a range of values (`calculable`).
 *
 * The 0..1 scale matches percentage values.
 * Since the color comes from the value, and not from the palette of the series, it does not suit charts of absolute
 * values (money, volumes): turn it off with the `withVisualMap` prop of the {@link EChart}.
 */
export const DEFAULT_VISUAL_MAP: VisualMapComponentOption = {
    min: 0,
    max: 1,
    calculable: true,
    text: ['100%', '0%'],
    inRange: { color: [VISUAL_MAP_MIN_COLOR, VISUAL_MAP_MAX_COLOR] }
};

/** Default values of the `option` of any chart, except the {@link DEFAULT_VISUAL_MAP} (which is optional). */
export const DEFAULT_OPTION: EChartsOption = {
    tooltip: DEFAULT_TOOLTIP,
    toolbox: DEFAULT_TOOLBOX
};

/** Default height of the chart, in pixels. */
export const DEFAULT_CHART_HEIGHT = 600;

/** Style used when no `style` is given to the {@link EChart}: it takes the whole available width. */
export const DEFAULT_STYLE: CSSProperties = { width: '100%', height: DEFAULT_CHART_HEIGHT };
