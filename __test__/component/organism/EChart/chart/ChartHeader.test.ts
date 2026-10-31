import { describe, expect, test } from '@jest/globals';

import {
    buildChartHeader,
    LEGEND_ROW_HEIGHT,
    legendExtraHeight,
    legendRows
} from '@/src/component/organism/EChart/chart/ChartHeader';
import { ptBR } from '@/src/i18n/messages/ptBR';

/*
 * jsdom has no canvas: the width of the names is estimated at 7px per character. Each legend item also has 30px of
 * icon and 8px of space until the next one, and the legend has 5px of inner padding on each side.
 * So names of 10 characters take 100px, and two of them in the same row take 208px.
 */
const NAMES = ['Indicator1', 'Indicator2', 'Indicator3'];

/** Width where two of the {@link NAMES} fit per row (2 x 100 + 8 of space + 2 x 5 of inner padding). */
const TWO_PER_ROW_WIDTH = 218;

describe('ChartHeader', () => {
    // With 'scroll', a long legend scrolls horizontally and hides names behind arrows.
    test('the legend wraps in rows instead of scrolling', () => {
        expect(buildChartHeader('T', NAMES).legend).toMatchObject({ type: 'plain', data: NAMES });
    });

    test('the save image button has the title of the given texts (en-US by default)', () => {
        const title = (header: ReturnType<typeof buildChartHeader>) =>
            (header.toolbox as { feature: { saveAsImage: { title: string } } }).feature.saveAsImage.title;

        expect(title(buildChartHeader('T', NAMES))).toBe('Save as image');
        expect(title(buildChartHeader('T', NAMES, ptBR.chart))).toBe('Exportar imagem');
    });

    test('the legend moves to the next row when the next item does not fit', () => {
        expect(legendRows(NAMES.slice(0, 2), TWO_PER_ROW_WIDTH)).toBe(1);
        expect(legendRows(NAMES, TWO_PER_ROW_WIDTH)).toBe(2);
        expect(legendRows(NAMES, TWO_PER_ROW_WIDTH - 1)).toBe(3);
    });

    test('a name wider than the chart takes a row by itself', () => {
        expect(legendRows(['A name much longer than the chart'], 50)).toBe(1);
    });

    // Before the chart is measured, there is no way to know where the legend wraps.
    test('without the width of the chart, considers the legend in one row', () => {
        expect(legendRows(NAMES)).toBe(1);
        expect(legendExtraHeight(NAMES)).toBe(0);
    });

    test('the extra height is the one of the legend rows beyond the first one', () => {
        expect(legendExtraHeight(NAMES, TWO_PER_ROW_WIDTH)).toBe(LEGEND_ROW_HEIGHT);
    });
});
