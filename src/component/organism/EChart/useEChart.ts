import { RefObject, useEffect, useRef } from 'react';

import type { EChartsOption, EChartsType, SetOptionOpts } from 'echarts';

/** notMerge: replaces the previous option, so attributes removed from the props disappear from the chart. */
const SET_OPTION_OPTS: SetOptionOpts = { notMerge: true };

/** Data ECharts gives to whoever handles an event (e.g. the name of the clicked series). */
export type EChartEventParams = {
    /** Name of the element (e.g. legend item or slice) related to the event. */
    name?: string;

    /** Name of the series related to the event, in click events on an element of the chart. */
    seriesName?: string;

    [attribute: string]: unknown;
};

/** Functions that handle ECharts events, indexed by the event name (e.g. `click`, `legendselectchanged`). */
export type EChartEventHandlers = Record<string, (params: EChartEventParams) => void>;

/** Generic handler signature accepted by `chart.on`/`chart.off`, which does not type the parameters of each event. */
type EChartsHandler = (...args: unknown[]) => void;

/** ECharts module, loaded on demand. */
type EChartsModule = typeof import('echarts');

/** Geometry of a map (e.g. a GeoJSON with the areas of the cities), in the format accepted by `echarts.registerMap`. */
export type EChartMapSource = Parameters<typeof import('echarts').registerMap>[1];

/** Maps used by the chart, indexed by the name the `map` series (or the `geo` component) use in the `map` attribute. */
export type EChartMaps = Record<string, EChartMapSource>;

/**
 * How ECharts draws the chart: in `canvas` (default, faster on screen) or in `svg`, which is printed as sharp vector
 * graphics or saved as PDF. Use `svg` in reports.
 */
export type EChartRenderer = 'canvas' | 'svg';

/**
 * Print media query. It changes when the browser applies (or removes) the paper layout, whose width differs from the
 * screen. It is more reliable than `beforeprint`, which fires before this layout and would measure the screen.
 */
const PRINT_MEDIA_QUERY = 'print';

/**
 * Manages the life cycle of an ECharts instance bound to a DOM element: creates the instance on mount, applies the
 * `option` whenever it changes, resizes the chart when the container changes its size and disposes the instance on
 * unmount.
 *
 * ECharts is loaded on demand (dynamic `import()`), so only the pages that show charts download the library.
 * @param option final option shown in the chart
 * @param onEvents functions that handle the chart events; they are replaced when the object changes
 * @param maps maps registered in ECharts before creating the chart; when they change, they are registered again and
 *        the chart is redrawn
 * @param renderer how the chart is drawn; read only when the chart is created
 * @return ref to assign to the element that will hold the chart
 */
export function useEChart(
    option: EChartsOption,
    onEvents?: EChartEventHandlers,
    maps?: EChartMaps,
    renderer: EChartRenderer = 'canvas'
): RefObject<HTMLDivElement | null> {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<EChartsType | null>(null);

    // Keeps the latest option, to apply it when ECharts finishes loading.
    const optionRef = useRef(option);

    // Keeps the latest handlers, to bind them when ECharts finishes loading.
    const onEventsRef = useRef(onEvents);

    // Handlers currently bound to the chart, so they are unbound before binding the new ones.
    const boundEventsRef = useRef<EChartEventHandlers | undefined>(undefined);

    // Keeps the latest maps, to register them when ECharts finishes loading.
    const mapsRef = useRef(maps);

    // ECharts module, kept after loading to register the maps that change.
    const echartsRef = useRef<EChartsModule | null>(null);

    /* Registers the new maps and redraws the chart already created, which still uses the previous geometry. Before
       ECharts loads, just keeps the maps. It comes before the option effect so that, if both change together, the new
       option already finds the new map. */
    useEffect(() => {
        mapsRef.current = maps;
        if (!echartsRef.current || !chartRef.current) return;

        registerMaps(echartsRef.current, maps);
        chartRef.current.setOption(optionRef.current, SET_OPTION_OPTS);
    }, [maps]);

    // Applies the new option to the chart already created. Before ECharts loads, just keeps the option for the other effect.
    useEffect(() => {
        optionRef.current = option;
        chartRef.current?.setOption(option, SET_OPTION_OPTS);
    }, [option]);

    // Replaces the event handlers of the chart already created. Before ECharts loads, just keeps the handlers.
    useEffect(() => {
        onEventsRef.current = onEvents;
        if (chartRef.current) replaceEvents(chartRef.current, boundEventsRef, onEvents);
    }, [onEvents]);

    // Keeps the renderer of the chart creation: changing it would require recreating the chart, which the hook does not do.
    const rendererRef = useRef(renderer);

    /* Runs only on mount: loads ECharts, registers the maps, creates the chart in the container with the latest option
       and resizes it when the container changes its size or the page is about to be printed. The maps are registered
       before the first `setOption`, otherwise ECharts does not find the map used by the series. */
    useEffect(() => {
        let unmounted = false;
        let resizeObserver: ResizeObserver | null = null;
        const resize = (): void => chartRef.current?.resize();
        const printMedia = window.matchMedia(PRINT_MEDIA_QUERY);
        printMedia.addEventListener('change', resize);

        import('echarts').then(echarts => {
            const container = containerRef.current;
            if (unmounted || !container) return;

            echartsRef.current = echarts;
            registerMaps(echarts, mapsRef.current);
            const chart = echarts.init(container, undefined, { renderer: rendererRef.current });
            chart.setOption(optionRef.current, SET_OPTION_OPTS);
            replaceEvents(chart, boundEventsRef, onEventsRef.current);
            chartRef.current = chart;

            resizeObserver = new ResizeObserver(() => chart.resize());
            resizeObserver.observe(container);
        });

        /* Cleanup, which React calls on unmount: releases the observer and the chart instance. The `unmounted` flag
           prevents the chart from being created if ECharts finishes loading after the component left the screen. */
        return (): void => {
            unmounted = true;
            printMedia.removeEventListener('change', resize);
            resizeObserver?.disconnect();
            chartRef.current?.dispose();
            chartRef.current = null;
        };
    }, []);

    return containerRef;
}

/**
 * Registers the maps in ECharts, so the series can use them by name.
 * @param echarts ECharts module
 * @param maps maps indexed by name; `undefined` registers nothing
 */
function registerMaps(echarts: EChartsModule, maps?: EChartMaps): void {
    Object.entries(maps ?? {}).forEach(([name, map]) => echarts.registerMap(name, map));
}

/**
 * Unbinds from the chart the handlers bound before and binds the new ones.
 * @param chart chart instance
 * @param boundEventsRef ref with the handlers currently bound; it is updated with the new ones
 * @param newHandlers handlers to bind; `undefined` just unbinds the previous ones
 */
function replaceEvents(
    chart: EChartsType,
    boundEventsRef: RefObject<EChartEventHandlers | undefined>,
    newHandlers?: EChartEventHandlers
): void {
    if (boundEventsRef.current) unbindEvents(chart, boundEventsRef.current);
    if (newHandlers) bindEvents(chart, newHandlers);
    boundEventsRef.current = newHandlers;
}

/**
 * Binds each handler to its event in the chart.
 * @param chart chart instance
 * @param onEvents handlers indexed by the event name
 */
function bindEvents(chart: EChartsType, onEvents: EChartEventHandlers): void {
    Object.entries(onEvents).forEach(([event, handler]) => chart.on(event, handler as EChartsHandler));
}

/**
 * Unbinds from the chart the handlers bound by {@link bindEvents}.
 * @param chart chart instance
 * @param onEvents handlers indexed by the event name
 */
function unbindEvents(chart: EChartsType, onEvents: EChartEventHandlers): void {
    Object.entries(onEvents).forEach(([event, handler]) => chart.off(event, handler as EChartsHandler));
}
