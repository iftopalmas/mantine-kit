/**
 * Creates an array of the given size, with the values from 0 to size - 1.
 * @param size size of the array
 */
export function createSequentialArray(size: number): number[] {
    return Array.from({ length: size }, (_, i) => i);
}

/**
 * Creates an array of any size, filled with the given value.
 * @param size size of the array
 * @param fillValue value of every element
 */
export function createFilledArray(size: number, fillValue: number = 0): number[] {
    return Array(size).fill(fillValue);
}

/**
 * Operation over two numbers that returns a new value from them.
 * @param number1 a number
 * @param number2 another number
 * @return a new value computed from the two numbers
 */
export type NumbersMapFunction = (number1: number, number2: number) => number;

/**
 * Applies an operation to the elements at the same position of two arrays, mapping each pair of values to a new value.
 * @param array1 an array
 * @param array2 another array
 * @param operation operation applied to each pair of elements at the same position (see {@link NumbersMapFunction})
 * @param defaultItemValue value used when one array has no element at a position of the other one (when the arrays
 *        have different sizes). A `NaN` (e.g. an empty year) is not replaced by the default: it propagates, so the
 *        result for that position is empty too.
 * @return a new array with the result of the operation for each position
 */
export function arraysMap(
    array1: number[],
    array2: number[],
    operation: NumbersMapFunction,
    defaultItemValue: number = 0
): number[] {
    if (array1.length === 0) return array2;

    if (array2.length === 0) return array1;

    const maxLen = Math.max(array1.length, array2.length);

    /* An array with just the indexes of the longest array, so that the result has the size of the longest one while
       keeping the order of the arguments (which may change the result of the operation). */
    const indexesArray = createSequentialArray(maxLen);
    return indexesArray.map(i => operation(array1[i] ?? defaultItemValue, array2[i] ?? defaultItemValue));
}

/**
 * Transposes a matrix, turning the rows into columns and vice versa.
 * @param matrix matrix to transpose, where each row is an array of values
 * @param defaultValForUndefinedCol value used when a row has no value for a column, which happens when the rows have
 *        different sizes. Without it, the missing column is `undefined`. The parameter has no default value on purpose:
 *        in JavaScript, passing `undefined` to a parameter with a default uses the default, so an `undefined`
 *        explicitly asked by the caller would become another value.
 * @return the transposed matrix
 */
export function transposeMatrix(matrix: number[][], defaultValForUndefinedCol?: number): number[][] {
    const reducer = (acc: number, curr: number) => (curr > acc ? curr : acc);

    // Length of the longest row of the matrix
    const maxCols = matrix.map(line => line.length).reduce(reducer, 0);
    const colIndexes = createSequentialArray(maxCols);
    // `??`, not `||`: a 0 (a real value) and a NaN (an empty year) are kept, and only a missing column uses the default.
    return colIndexes.map(col => matrix.map(line => line[col] ?? defaultValForUndefinedCol));
}
