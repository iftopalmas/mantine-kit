/**
 * Query string in the format of the `searchParams` prop that Next.js gives to pages (in a `Promise`, since Next.js
 * 15): each parameter has a value, an array of values (when it repeats in the URL) or `undefined` (when it is absent).
 */
type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Returns the value of a query string parameter received by a page.
 * @param searchParams URL parameters, as received by the page (already resolved with `use()` or `await`)
 * @param name name of the parameter
 * @return the value of the parameter; the first one, if it repeats in the URL; or `null`, if it is absent
 */
function getSearchParam(searchParams: SearchParams, name: string): string | null {
    const value = searchParams[name];
    return (Array.isArray(value) ? value[0] : value) ?? null;
}

/** Value of a parameter when building a URL. `undefined`, `null` and an empty string leave the parameter out. */
type SearchParamValue = number | string | null | undefined;

/**
 * Builds a URL with the query string of the parameters that have a value.
 * @param path path of the page
 * @param params parameters indexed by name; the ones without a value ({@link SearchParamValue}) are left out
 * @return the path with the query string, or just the path if no parameter has a value
 */
function buildUrl(path: string, params: Record<string, SearchParamValue>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([name, value]) => {
        if (value !== undefined && value !== null && value !== '') query.set(name, String(value));
    });

    const queryString = query.toString();
    return queryString ? `${path}?${queryString}` : path;
}

export type { SearchParams, SearchParamValue };
export { buildUrl, getSearchParam };
