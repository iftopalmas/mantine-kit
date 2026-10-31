/**
 * Error of a request to the API, with the user-friendly message already extracted by the {@link AxiosHttpClient}
 * and, optionally, the `code` returned by the backend. The `code` allows the code that handles the error to identify
 * the reason programmatically (e.g. a concurrent update), without relying on the text of `message`, which is just for
 * display.
 * @template C type of the error codes of the backend. An app may restrict it to the codes the backend sends (e.g. a
 *           union of strings generated from a backend enum), so the compiler points out codes that no longer exist.
 * @author Manoel Campos
 */
export class ApiError<C extends string = string> extends Error {
    public readonly code?: C;

    constructor(message: string, code?: C) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
    }
}
