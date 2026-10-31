import { describe, expect, test } from '@jest/globals';
import type { EChartsOption } from 'echarts';

import { buildEChartOption, toEChartData } from '@/src/component/organism/EChart/buildEChartOption';
import { DEFAULT_TOOLBOX, DEFAULT_TOOLTIP, DEFAULT_VISUAL_MAP } from '@/src/component/organism/EChart/echartDefaults';

/** Domain item: an index per city, identified by the code that links it to the area of the city in a map. */
type CityIndex = { cityCode: string; index: number | null };

/** Input data, including an absent index (`null`), which must be passed to ECharts unchanged. */
const indexes: CityIndex[] = [
    { cityCode: '1721000', index: 0.95 },
    { cityCode: '1702109', index: null }
];

/** Uses the city code as the name, since it links each value to the area of the city in the map. */
const accessors = {
    getName: (item: CityIndex): string => item.cityCode,
    getValue: (item: CityIndex): number | null => item.index
};

/** Expected result of converting {@link indexes} to the ECharts `{ name, value }` format. */
const expectedData = [
    { name: '1721000', value: 0.95 },
    { name: '1702109', value: null }
];

/** Checks the conversion of the domain data to the elements of the series. */
describe('toEChartData', () => {
    test('converts the domain data to { name, value }', () => {
        expect(toEChartData(indexes, accessors)).toEqual(expectedData);
    });
});

/**
 * Checks how the final option is built: the default values, the merge with the given option and the `data` of the
 * series.
 */
describe('buildEChartOption', () => {
    test('applies the default values when no option is given', () => {
        expect(buildEChartOption(indexes, accessors)).toEqual({
            tooltip: DEFAULT_TOOLTIP,
            toolbox: DEFAULT_TOOLBOX,
            visualMap: DEFAULT_VISUAL_MAP
        });
    });

    test('does not apply the default visualMap when withVisualMap is false', () => {
        expect(buildEChartOption(indexes, accessors, {}, false)).not.toHaveProperty('visualMap');
    });

    test('the option attributes replace the defaults without dropping the rest (deep merge)', () => {
        const option: EChartsOption = { tooltip: { show: false }, visualMap: { max: 100 } };
        const result = buildEChartOption(indexes, accessors, option);

        expect(result.tooltip).toEqual({ ...DEFAULT_TOOLTIP, show: false });
        expect(result.visualMap).toEqual({ ...DEFAULT_VISUAL_MAP, max: 100 });
        expect(result.toolbox).toEqual(DEFAULT_TOOLBOX);
    });

    test('fills the data of each series of the series array', () => {
        const option: EChartsOption = { series: [{ type: 'map', map: 'cities' }, { type: 'pie' }] };
        const result = buildEChartOption(indexes, accessors, option);

        expect(result.series).toEqual([
            { type: 'map', map: 'cities', data: expectedData },
            { type: 'pie', data: expectedData }
        ]);
    });

    test('fills the data when series is a single object', () => {
        const result = buildEChartOption(indexes, accessors, { series: { type: 'pie' } });

        expect(result.series).toEqual({ type: 'pie', data: expectedData });
    });

    test('keeps the data of the series that already define their own data', () => {
        const ownData = [{ name: 'other', value: 1 }];
        const result = buildEChartOption(indexes, accessors, { series: [{ type: 'pie', data: ownData }] });

        expect(result.series).toEqual([{ type: 'pie', data: ownData }]);
    });
});

describe('buildEChartOption with a save image title', () => {
    test('uses the title given for the save image button, keeping the other toolbox defaults', () => {
        const result = buildEChartOption(indexes, accessors, {}, true, 'Save as image');

        expect(result.toolbox).toEqual({
            feature: { saveAsImage: { ...DEFAULT_TOOLBOX.feature?.saveAsImage, title: 'Save as image' } }
        });
    });
});
