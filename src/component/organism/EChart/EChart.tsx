'use client';

import { CSSProperties, ReactElement, useMemo } from 'react';

import type { EChartsOption } from 'echarts';

import { useKitMessages } from '../../../provider/useKit';
import { buildEChartOption, EChartDataAccessors } from './buildEChartOption';
import { DEFAULT_STYLE } from './echartDefaults';
import { EChartEventHandlers, EChartMaps, EChartRenderer, useEChart } from './useEChart';

/**
 * Props of the {@link EChart}. `getName` and `getValue` extract from each item of `data` the name and the value of the
 * element in the chart.
 */
export type EChartProps<T> = EChartDataAccessors<T> & {
    /** Raw domain data, used to fill the `data` of the series that define no data of their own. */
    data: T[];

    /**
     * ECharts options specific to the chart (series type, map, axes etc.).
     * They replace the default values of `tooltip`, `toolbox` and `visualMap` (deep merge).
     */
    option?: EChartsOption;

    /**
     * Whether the elements of the chart should be colored according to their percentage value (0..1), showing a
     * gradient legend from "0%" to "100%" (see {@link DEFAULT_VISUAL_MAP}). Default: `true`.
     * Turn it off in charts of absolute values (money, volumes), since the 0..1 scale does not match these values and
     * the color of the series would be replaced by the one of the scale.
     */
    withVisualMap?: boolean;

    /**
     * Functions that handle ECharts events, indexed by the event name (e.g. `click`, `legendselectchanged`).
     * Prefer a stable object (e.g. with `useMemo`), since the handlers are bound again when the object changes.
     */
    onEvents?: EChartEventHandlers;

    /**
     * Maps (e.g. the GeoJSON of the cities) used by the `map` series, indexed by the name used in `series[i].map`.
     * They are registered before the chart is created and again when the object changes, so prefer a stable object
     * (e.g. with `useMemo`).
     */
    maps?: EChartMaps;

    /** How the chart is drawn: `svg` is printed as vector graphics (e.g. in reports). Default: `canvas`. */
    renderer?: EChartRenderer;

    /** Style of the chart container. Default: {@link DEFAULT_STYLE}. */
    style?: CSSProperties;

    className?: string;
};

/**
 * React wrapper of Apache ECharts that receives the raw domain data and builds the series from it, applying the
 * default `option` values.
 * The chart is redrawn when a prop changes, so prefer giving stable `option`, `getName` and `getValue` (e.g. with
 * `useMemo`/`useCallback` or defined outside the component) to avoid needless redraws.
 */
export function EChart<T>({
    data,
    getName,
    getValue,
    option,
    withVisualMap = true,
    onEvents,
    maps,
    renderer,
    style = DEFAULT_STYLE,
    className
}: EChartProps<T>): ReactElement {
    const saveAsImageTitle = useKitMessages().chart.saveAsImage;
    const finalOption = useMemo(
        () => buildEChartOption(data, { getName, getValue }, option, withVisualMap, saveAsImageTitle),
        [data, getName, getValue, option, withVisualMap, saveAsImageTitle]
    );
    const containerRef = useEChart(finalOption, onEvents, maps, renderer);

    return <div ref={containerRef} style={style} className={className} />;
}
