/**
 * Returns the number values of an enum. Values of other types are not returned.
 * @param enumType enum to read the values from
 */
export function getEnumValues(enumType: object): number[] {
    return Object.values(enumType).filter(value => typeof value === 'number');
}

/**
 * Returns the keys of an enum.
 * @param enumType enum to read the keys from
 * @template KeyType type of the returned keys. The keys are strings by default. To use them to read the enum values
 *           as an array (`MyEnum[key]`), use `keyof typeof MyEnum`.
 */
export function getEnumKeys<KeyType = string>(enumType: object): KeyType[] {
    return Object.values(enumType)
        .filter(key => typeof key === 'string')
        .map(key => key as KeyType);
}

/**
 * Returns a `Map` whose keys are the values of the enum items and whose values are the keys of these items.
 * @param enumType enum to read the entries from
 * @template KeyType type of the returned keys. The keys are strings by default. To use them to read the enum values
 *           as an array (`MyEnum[key]`), use `keyof typeof MyEnum`.
 */
export function getEnumEntries<KeyType = string>(enumType: object): Map<number, KeyType> {
    const map = new Map<number, KeyType>();
    Object.entries(enumType)
        .filter(([, value]) => typeof value === 'number')
        .forEach(([key, value]) => map.set(value, key as KeyType));

    return map;
}
