import { KitLocale } from '../i18n/KitLocale';
import { HttpMessages } from '../i18n/KitMessages';

/** Message and code extracted from the body of an error response of the backend. */
export type ParsedApiError = {
    /** Message to show to the user; if absent, a generic message is used. */
    message?: string;

    /** Code that identifies the reason of the error (see {@link ApiError}). */
    code?: string;
};

/** Configuration of an {@link AxiosHttpClient}. */
export type AxiosHttpClientConfig = {
    /** Address of the API, prefixed to the paths of the requests (e.g. `http://localhost:8080`). */
    baseURL: string;

    /** Maximum time to wait for a response (ms). Default: {@link DEFAULT_TIMEOUT_MS}. */
    timeout?: number;

    /** Whether cookies and credentials are sent in requests to another origin. Default: `false`. */
    withCredentials?: boolean;

    /** Headers sent in every request. */
    headers?: Record<string, string>;

    /**
     * Extracts the message and the code from the body of an error response. The default ({@link parseErrorBody})
     * reads the `message` and `code` fields of a JSON object (e.g. the error body of a Spring API).
     */
    errorParser?: (body: unknown) => ParsedApiError;

    /** Locale of the generic error messages. Default: `en-US`. */
    locale?: KitLocale;

    /** Generic error messages, replacing the ones of the locale. */
    messages?: Partial<HttpMessages>;
};

/** Default maximum time to wait for a response (ms). */
export const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Default error parser: reads the `message` and `code` fields of the response body, if it is an object.
 * @param body body of the error response
 * @return the message and the code found
 */
export function parseErrorBody(body: unknown): ParsedApiError {
    if (body === null || typeof body !== 'object') return {};

    const message = 'message' in body && body.message ? String(body.message) : undefined;
    const code = 'code' in body && body.code ? String(body.code) : undefined;

    return { message, code };
}
