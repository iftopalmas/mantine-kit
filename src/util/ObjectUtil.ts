/**
 * Plain object, whose attributes can be read and assigned by name.
 */
type PlainObject = Record<string, unknown>;

/**
 * Checks whether a value is a plain object (a `{}` literal), and not an array, `null`, a date, a function etc.
 * Only plain objects are merged recursively by {@link mergeDeep}.
 * @param value value to check
 * @return `true` if the value is a plain object, which can be merged recursively
 */
export function isPlainObject(value: unknown): value is PlainObject {
    if (value === null || typeof value !== 'object') return false;
    const prototype = Object.getPrototypeOf(value);

    return prototype === Object.prototype || prototype === null;
}

/**
 * Merges two objects recursively, returning a new object without changing the original ones.
 * The attributes of `override` take precedence over the ones of `base`. When an attribute is a plain object in both,
 * they are merged recursively; otherwise (including arrays), the value of `override` replaces the one of `base`.
 * `undefined` attributes in `override` are ignored, keeping the value of `base`.
 * @param base object with the default values
 * @param override object with the values that replace the ones of `base`
 * @return a new object with both merged
 */
export function mergeDeep<T extends object>(base: T, override: Partial<T>): T {
    const result = { ...base } as PlainObject;

    for (const [key, overrideValue] of Object.entries(override)) {
        if (overrideValue === undefined) continue;

        const baseValue = result[key];
        result[key] =
            isPlainObject(baseValue) && isPlainObject(overrideValue)
                ? mergeDeep(baseValue, overrideValue)
                : overrideValue;
    }

    return result as T;
}
