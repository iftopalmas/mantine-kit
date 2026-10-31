import { describe, expect, test } from '@jest/globals';

import {
    BOTTOM_MARGIN,
    buildPanelAxes,
    formatCompactNumber,
    groupByUnit,
    MIN_CATEGORIES_FOR_ZOOM,
    needsZoom,
    PANEL_GAP,
    PANEL_HEIGHT,
    PANELS_TOP,
    panelsHeight,
    ZOOM_HEIGHT
} from '@/src/component/organism/EChart/chart/UnitPanels';
import { MONEY, PERCENT, series } from '@/__test__/component/organism/EChart/chart/ChartFixture';

/** Non-breaking space used by Intl between the number and the compact suffix (e.g. "1,3 mi"). */
const NBSP = ' ';

describe('UnitPanels', () => {
    const chartSeries = [series('A', [1], MONEY), series('B', [1], PERCENT), series('C', [1], MONEY)];

    test('groups the series by unit, in the order each unit appears', () => {
        const panels = groupByUnit(chartSeries);

        expect(panels.map(panel => panel.unit.label)).toEqual(['$', '%']);
        expect(panels[0].series.map(s => s.name)).toEqual(['A', 'C']);
    });

    test('the height grows with the number of panels and with the zoom bar', () => {
        expect(panelsHeight(1, 2)).toBe(PANELS_TOP + PANEL_HEIGHT + BOTTOM_MARGIN);
        expect(panelsHeight(2, MIN_CATEGORIES_FOR_ZOOM)).toBe(
            PANELS_TOP + 2 * PANEL_HEIGHT + PANEL_GAP + BOTTOM_MARGIN + ZOOM_HEIGHT
        );
    });

    // The extra room is the one of the extra legend rows, which is above the first panel.
    test('the extra room at the top moves the panels down and increases the height', () => {
        const extraTop = 22;
        const [grid] = buildPanelAxes(groupByUnit(chartSeries), [2025], extraTop).grid as { top: number }[];

        expect(grid.top).toBe(PANELS_TOP + extraTop);
        expect(panelsHeight(1, 2, extraTop)).toBe(panelsHeight(1, 2) + extraTop);
    });

    test('shows the zoom bar only from a minimum number of categories', () => {
        expect(needsZoom(MIN_CATEGORIES_FOR_ZOOM - 1)).toBe(false);
        expect(needsZoom(MIN_CATEGORIES_FOR_ZOOM)).toBe(true);
    });

    // Each unit has its own Y axis, with the unit in the name: that is what makes the units explicit in the chart.
    test('creates a grid and a pair of axes per panel, with the unit in the name of the Y axis', () => {
        const axes = buildPanelAxes(groupByUnit(chartSeries), [2025, 2026]);

        expect(axes.grid).toHaveLength(2);
        expect(axes.xAxis).toEqual([
            expect.objectContaining({ gridIndex: 0, data: ['2025', '2026'] }),
            expect.objectContaining({ gridIndex: 1, data: ['2025', '2026'] })
        ]);
        expect(axes.yAxis).toEqual([
            expect.objectContaining({ gridIndex: 0, name: '$' }),
            expect.objectContaining({ gridIndex: 1, name: '%' })
        ]);
        expect(axes.dataZoom).toEqual([]);
    });

    test('formats the axis values in a compact way, in the locale', () => {
        expect(formatCompactNumber(1250000)).toBe('1.3M');
        expect(formatCompactNumber(950)).toBe('950');
        expect(formatCompactNumber(1250000, 'pt-BR')).toBe(`1,3${NBSP}mi`);
    });
});
