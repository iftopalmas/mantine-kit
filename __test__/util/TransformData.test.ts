import { formatValues, withPlaceholderFromLabel } from '@/src/util/TransformData';

describe('formatValues', () => {
    test.each([{ items: [] }, { items: [{ id: 1 }, { id: 2 }] }])(
        'keeps arrays of objects as arrays: %j',
        ({ items }) => {
            const result = formatValues({ items });

            expect(result.items).toStrictEqual(items);
            expect(Array.isArray(result.items)).toBe(true);
            expect(JSON.parse(JSON.stringify(result))).toStrictEqual({ items });
        }
    );

    test('keeps arrays of primitives, matrices and nested objects', () => {
        const input = { groups: [{ values: [[0, 1], [], [null, false, 'text']] }], empty: {} };

        expect(formatValues(input)).toStrictEqual(input);
    });

    test('converts dates in fields, objects and arrays to the same calendar format', () => {
        const date = new Date(2026, 8, 27, 23, 30);
        const input = { date, object: { date }, dates: [date, { date }, [date]] };

        expect(formatValues(input)).toStrictEqual({
            date: '2026-09-27',
            object: { date: '2026-09-27' },
            dates: ['2026-09-27', { date: '2026-09-27' }, ['2026-09-27']]
        });
    });

    test('keeps null, undefined and primitive values', () => {
        const input = { nullValue: null, undefinedValue: undefined, zero: 0, active: false, text: '' };

        expect(formatValues(input)).toStrictEqual(input);
    });

    test('creates new structures without changing the original form data', () => {
        const date = new Date(2026, 8, 27);
        const item = Object.freeze({ date, values: Object.freeze([1, 2]) });
        const input = Object.freeze({ items: Object.freeze([item]) });
        const timestamp = date.getTime();
        const result = formatValues(input);

        expect(result).toStrictEqual({ items: [{ date: '2026-09-27', values: [1, 2] }] });
        expect(result).not.toBe(input);
        expect(result.items).not.toBe(input.items);
        expect(input.items[0]).toBe(item);
        expect(item.date).toBe(date);
        expect(date.getTime()).toBe(timestamp);
    });
});

describe('withPlaceholderFromLabel', () => {
    const placeholder = (label: string) => `Select the ${label}`;

    test('builds the placeholder from the label', () => {
        expect(withPlaceholderFromLabel(placeholder, { label: 'Region' })).toEqual({
            label: 'Region',
            placeholder: 'Select the Region'
        });
    });

    test('keeps the placeholder given in the props', () => {
        expect(withPlaceholderFromLabel(placeholder, { label: 'Region', placeholder: 'Choose' }).placeholder).toBe(
            'Choose'
        );
    });
});
