import { describe, expect, test } from '@jest/globals';
import { createSequentialArray } from '@/src/util/ArrayUtil';
import { arraysMap, createFilledArray, NumbersMapFunction, transposeMatrix } from '@/src/util/ArrayUtil';

describe('ArrayUtil', () => {
    const sum: NumbersMapFunction = (a, b) => a + b;
    const subtract: NumbersMapFunction = (a, b) => a - b;

    test('createSequentialArray(): creates an array whose values are equal to the indexes', () => {
        const expected = [0, 1, 2, 3, 4];
        const numbers = createSequentialArray(expected.length);
        expect(numbers).toStrictEqual(expected);
    });

    test('createFilledArray(): creates an array of zeros', () => {
        const expected = [0, 0, 0, 0];
        const numbers = createFilledArray(expected.length);
        expect(numbers).toStrictEqual(expected);
    });

    test('createFilledArray(): creates an array with all values equal to the given one', () => {
        const value = 2;
        const expected = [value, value, value, value];
        const numbers = createFilledArray(expected.length, value);
        expect(numbers).toStrictEqual(expected);
    });

    test('arraysMap(): adds two arrays of the same size', () => {
        const array1 = [0, 1, 2, 3, 4];
        const array2 = [1, 2, 3, 4, 5];
        const expected = [1, 3, 5, 7, 9];
        const numbers = arraysMap(array1, array2, sum);

        expect(numbers).toStrictEqual(expected);
    });

    test('arraysMap(): adding array1 longer than array2 returns an array of the size of array1', () => {
        const array1 = [0, 1, 2, 3, 4];
        const array2 = [1, 2, 3, 4];
        const expected = [1, 3, 5, 7, 4];
        const numbers = arraysMap(array1, array2, sum);

        expect(numbers).toStrictEqual(expected);
    });

    test('arraysMap(): adding array2 longer than array1 returns an array of the size of array2', () => {
        const array1 = [0, 1, 2, 3];
        const array2 = [1, 2, 3, 4, 5];
        const expected = [1, 3, 5, 7, 5];
        const numbers = arraysMap(array1, array2, sum);

        expect(numbers).toStrictEqual(expected);
    });

    test('arraysMap(): adding an empty first array returns the data of the second one', () => {
        const array1: number[] = [];
        const array2 = [0, 1, 2, 3];
        const expected = array2;
        const numbers = arraysMap(array1, array2, sum);

        expect(numbers).toStrictEqual(expected);
    });

    test('arraysMap(): adding an empty second array returns the data of the first one', () => {
        const array1 = [0, 1, 2, 3];
        const array2: number[] = [];
        const expected = array1;
        const numbers = arraysMap(array1, array2, sum);

        expect(numbers).toStrictEqual(expected);
    });

    test('arraysMap(): subtracting a shorter array2 keeps the order of the arrays and returns positive values', () => {
        const array1 = [10, 20, 30, 40, 50];
        const array2 = [1, 2, 3];
        const expected = [9, 18, 27, 40, 50];
        const numbers = arraysMap(array1, array2, subtract);

        expect(numbers).toStrictEqual(expected);
    });

    test('arraysMap(): subtracting a longer array2 returns negative values for the positions missing in array1', () => {
        // Since array1 is shorter than array2, arraysMap considers the missing values of array1 as 0
        const array1 = [10, 20, 30];
        const array2 = [1, 2, 3, 4, 5];
        const expected = [9, 18, 27, -4, -5];
        const numbers = arraysMap(array1, array2, subtract);

        expect(numbers).toStrictEqual(expected);
    });

    /** A 0 is a real value, and a NaN is an empty year: both are kept, and only the missing column uses the default. */
    test('transposeMatrix(): keeps 0 and NaN and uses the default only in the missing column', () => {
        expect(transposeMatrix([[0, NaN], [2]], undefined)).toStrictEqual([
            [0, 2],
            [NaN, undefined]
        ]);
        expect(transposeMatrix([[0, NaN], [2]], 0)).toStrictEqual([
            [0, 2],
            [NaN, 0]
        ]);
    });
});
