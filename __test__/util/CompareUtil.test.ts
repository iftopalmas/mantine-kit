import { compareText, compareValues, isAbsent } from '@/src/util/CompareUtil';

describe('compareText', () => {
    test('sorts accented and lower case letters with the equivalent letters, according to the locale', () => {
        const names = ['Zé Doca', 'Palmas', 'Água Fria', 'brejinho', 'Araguaína'];
        expect([...names].sort((a, b) => compareText(a, b))).toEqual([
            'Água Fria',
            'Araguaína',
            'brejinho',
            'Palmas',
            'Zé Doca'
        ]);
    });

    // Comparing digit by digit, "District 10" would come before "District 2".
    test('compares the numbers inside the text by value', () => {
        const names = ['District 10', 'District 2', 'District 1'];
        expect([...names].sort((a, b) => compareText(a, b))).toEqual(['District 1', 'District 2', 'District 10']);
    });

    // In Swedish, "ä" comes after "z"; in English, it stays with "a".
    test('follows the given locale', () => {
        expect(compareText('ä', 'z', 'sv')).toBeGreaterThan(0);
        expect(compareText('ä', 'z', 'en-US')).toBeLessThan(0);
    });
});

describe('compareValues', () => {
    // Comparing numbers as text would place 10 before 9.
    test('compares numbers by value', () => {
        expect([10, 9, 100, -1].sort((a, b) => compareValues(a, b))).toEqual([-1, 9, 10, 100]);
    });

    test('compares dates by instant', () => {
        const dates = [new Date(2026, 1, 1), new Date(2025, 0, 1), new Date(2026, 0, 1)];
        expect(
            dates.sort((a, b) => compareValues(a, b)).map(date => date.getFullYear() * 100 + date.getMonth())
        ).toEqual([202500, 202600, 202601]);
    });

    test('compares the other values by their text representation', () => {
        expect([true, false].sort((a, b) => compareValues(a, b))).toEqual([false, true]);
    });

    test('places absent values last', () => {
        expect([undefined, 'b', null, 'a'].sort((a, b) => compareValues(a, b))).toEqual(['a', 'b', null, undefined]);
        expect(compareValues(null, undefined)).toBe(0);
    });
});

test.each([
    [null, true],
    [undefined, true],
    [0, false],
    ['', false]
])('isAbsent(%p) is %p', (value, absent) => {
    expect(isAbsent(value)).toBe(absent);
});
