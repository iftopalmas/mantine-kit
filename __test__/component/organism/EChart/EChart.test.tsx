import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { waitFor } from '@testing-library/react';

import { EChart } from '@/src/component/organism/EChart/EChart';
import type { EChartMaps } from '@/src/component/organism/EChart/useEChart';
import { DEFAULT_CHART_HEIGHT, DEFAULT_TOOLTIP } from '@/src/component/organism/EChart/echartDefaults';
import { render } from '@/test-utils';

/** Fake chart instance, to check the calls made by the component without drawing anything. */
const chartMock = { setOption: jest.fn(), resize: jest.fn(), dispose: jest.fn(), on: jest.fn(), off: jest.fn() };
/** Replaces `echarts.init`, always returning the {@link chartMock}. */
const initMock = jest.fn<(...args: unknown[]) => typeof chartMock>(() => chartMock);
/** Replaces `echarts.registerMap`, to check which maps are registered. */
const registerMapMock = jest.fn();

// jsdom has no canvas, so ECharts is replaced by a mock (which also applies to the dynamic import() of useEChart).
jest.mock('echarts', () => ({
    init: (...args: unknown[]): typeof chartMock => initMock(...args),
    registerMap: (...args: unknown[]): void => {
        registerMapMock(...args);
    }
}));

/** Keeps the callback of the ResizeObserver created by the component, to simulate a change in the container size. */
let resizeCallback: () => void = () => {};
/** Records the calls to `ResizeObserver.disconnect`, to check that the observer is released on unmount. */
const disconnectMock = jest.fn();

/** ResizeObserver defined in `jest.setup.cjs`, restored after each test. */
const OriginalResizeObserver = window.ResizeObserver;

/** Fake domain item, used to check the conversion to `{ name, value }`. */
type Item = { label: string; amount: number };
const data: Item[] = [{ label: 'A', amount: 0.5 }];
const getName = (item: Item): string => item.label;
const getValue = (item: Item): number => item.amount;

/**
 * Returns the div of the chart. It does not use `container.firstChild` because the MantineProvider adds `<style>` tags
 * before it.
 * @param container element where the component was rendered
 * @return the div that holds the chart
 */
function getChartContainer(container: HTMLElement): HTMLDivElement {
    return container.querySelector('div') as HTMLDivElement;
}

/**
 * Tests the component with ECharts and ResizeObserver replaced by mocks: style of the container, creation of the
 * instance with the built option, resizing and release of the resources on unmount.
 */
describe('EChart', () => {
    // Replaces ResizeObserver with a version that keeps the callback, so the tests can trigger the resize.
    beforeEach(() => {
        jest.clearAllMocks();
        window.ResizeObserver = class {
            constructor(callback: () => void) {
                resizeCallback = callback;
            }

            observe(): void {}

            unobserve(): void {}

            disconnect(): void {
                disconnectMock();
            }
        } as unknown as typeof ResizeObserver;
    });

    afterEach(() => {
        window.ResizeObserver = OriginalResizeObserver;
    });

    test('applies the default style when no style is given', () => {
        const { container } = render(<EChart data={data} getName={getName} getValue={getValue} />);

        const { style } = getChartContainer(container);

        expect(style.width).toBe('100%');
        expect(style.height).toBe(`${DEFAULT_CHART_HEIGHT}px`);
    });

    test('uses the given style instead of the default one', () => {
        const { container } = render(
            <EChart data={data} getName={getName} getValue={getValue} style={{ height: 200 }} />
        );

        const { style } = getChartContainer(container);

        expect(style.height).toBe('200px');
        expect(style.width).toBe('');
    });

    test('creates the instance and applies the option with the converted data', async () => {
        render(<EChart data={data} getName={getName} getValue={getValue} option={{ series: [{ type: 'pie' }] }} />);

        await waitFor(() => expect(chartMock.setOption).toHaveBeenCalled());
        expect(initMock).toHaveBeenCalledTimes(1);
        expect(chartMock.setOption).toHaveBeenCalledWith(
            expect.objectContaining({
                tooltip: DEFAULT_TOOLTIP,
                series: [{ type: 'pie', data: [{ name: 'A', value: 0.5 }] }]
            }),
            { notMerge: true }
        );
    });

    test('resizes the chart when the container changes its size', async () => {
        render(<EChart data={data} getName={getName} getValue={getValue} />);
        await waitFor(() => expect(initMock).toHaveBeenCalled());

        resizeCallback();

        expect(chartMock.resize).toHaveBeenCalledTimes(1);
    });

    test('disposes the instance on unmount', async () => {
        const { unmount } = render(<EChart data={data} getName={getName} getValue={getValue} />);
        await waitFor(() => expect(initMock).toHaveBeenCalled());

        unmount();

        expect(chartMock.dispose).toHaveBeenCalledTimes(1);
        expect(disconnectMock).toHaveBeenCalledTimes(1);
    });

    test('does not create the instance if the component is unmounted before ECharts loads', async () => {
        const { unmount } = render(<EChart data={data} getName={getName} getValue={getValue} />);
        unmount();

        // Lets the dynamic import() of ECharts finish, after the component was unmounted.
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(initMock).not.toHaveBeenCalled();
    });

    test('binds the event handlers after creating the instance', async () => {
        const onEvents = { click: jest.fn() };
        render(<EChart data={data} getName={getName} getValue={getValue} onEvents={onEvents} />);

        await waitFor(() => expect(chartMock.on).toHaveBeenCalledWith('click', onEvents.click));
    });

    // Without unbinding the old handlers, a click would call both the new and the old handler (with an old state).
    test('replaces the handlers when the onEvents prop changes', async () => {
        const oldHandlers = { click: jest.fn() };
        const newHandlers = { click: jest.fn() };
        const { rerender } = render(
            <EChart data={data} getName={getName} getValue={getValue} onEvents={oldHandlers} />
        );
        await waitFor(() => expect(chartMock.on).toHaveBeenCalledWith('click', oldHandlers.click));

        // Same fragment used by the render of test-utils; without it, React would remount the component instead of updating it.
        rerender(
            <>
                <EChart data={data} getName={getName} getValue={getValue} onEvents={newHandlers} />
            </>
        );

        expect(chartMock.off).toHaveBeenCalledWith('click', oldHandlers.click);
        expect(chartMock.on).toHaveBeenCalledWith('click', newHandlers.click);
    });

    // Without registering the map before the first setOption, ECharts does not find the map used by the series.
    test('registers the maps before creating the instance', async () => {
        const geometry = { type: 'FeatureCollection', features: [] };
        const maps = { cities: geometry } as unknown as EChartMaps;
        render(<EChart data={data} getName={getName} getValue={getValue} maps={maps} />);

        await waitFor(() => expect(initMock).toHaveBeenCalled());

        expect(registerMapMock).toHaveBeenCalledWith('cities', geometry);
        expect(registerMapMock.mock.invocationCallOrder[0]).toBeLessThan(initMock.mock.invocationCallOrder[0]);
    });

    test('registers no map when the maps prop is not given', async () => {
        render(<EChart data={data} getName={getName} getValue={getValue} />);

        await waitFor(() => expect(initMock).toHaveBeenCalled());

        expect(registerMapMock).not.toHaveBeenCalled();
    });

    // A new geometry (e.g. of other states) must be registered and the chart redrawn with it.
    test('registers again and redraws when the maps prop changes', async () => {
        const oldMaps = { cities: { type: 'FeatureCollection', features: [] } } as unknown as EChartMaps;
        const newMaps = { cities: { type: 'FeatureCollection', features: [{}] } } as unknown as EChartMaps;
        const { rerender } = render(<EChart data={data} getName={getName} getValue={getValue} maps={oldMaps} />);
        await waitFor(() => expect(initMock).toHaveBeenCalled());
        chartMock.setOption.mockClear();

        rerender(
            <>
                <EChart data={data} getName={getName} getValue={getValue} maps={newMaps} />
            </>
        );

        expect(registerMapMock).toHaveBeenLastCalledWith('cities', newMaps.cities);
        expect(chartMock.setOption).toHaveBeenCalledTimes(1);
    });

    test('draws in canvas by default and in SVG when asked, to be printed as vector graphics', async () => {
        render(<EChart data={data} getName={getName} getValue={getValue} />);
        await waitFor(() => expect(initMock).toHaveBeenCalled());
        expect(initMock.mock.calls[0][2]).toEqual({ renderer: 'canvas' });

        render(<EChart data={data} getName={getName} getValue={getValue} renderer="svg" />);
        await waitFor(() => expect(initMock).toHaveBeenCalledTimes(2));
        expect(initMock.mock.calls[1][2]).toEqual({ renderer: 'svg' });
    });

    // The paper has another width than the screen, so the chart is resized when the print media changes.
    test('resizes the chart when entering and leaving print and stops listening to it on unmount', async () => {
        const printMedia = new EventTarget();
        const originalMatchMedia = window.matchMedia;
        window.matchMedia = jest.fn(() => printMedia) as unknown as typeof window.matchMedia;
        try {
            const { unmount } = render(<EChart data={data} getName={getName} getValue={getValue} />);
            await waitFor(() => expect(initMock).toHaveBeenCalled());
            expect(window.matchMedia).toHaveBeenCalledWith('print');

            printMedia.dispatchEvent(new Event('change'));
            printMedia.dispatchEvent(new Event('change'));
            expect(chartMock.resize).toHaveBeenCalledTimes(2);

            unmount();
            printMedia.dispatchEvent(new Event('change'));
            expect(chartMock.resize).toHaveBeenCalledTimes(2);
        } finally {
            window.matchMedia = originalMatchMedia;
        }
    });
});
