/**
 * @jest-environment node
 */
import { describe, expect, test } from '@jest/globals';
import { AxiosAdapter, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { ApiError } from '@/src/http/ApiError';
import { AxiosHttpClient } from '@/src/http/AxiosHttpClient';
import { AxiosHttpClientConfig, DEFAULT_TIMEOUT_MS, parseErrorBody } from '@/src/http/AxiosHttpClientConfig';

/**
 * Creates a client whose requests do not leave the machine: the Axios adapter is replaced by the given one, which
 * decides the response of each request.
 * @param adapter adapter that simulates the backend
 * @param config configuration of the client, besides the `baseURL`
 */
function client(adapter: AxiosAdapter, config: Partial<AxiosHttpClientConfig> = {}): AxiosHttpClient {
    const httpClient = new AxiosHttpClient({ baseURL: 'http://api.test', ...config });
    httpClient.axiosInstance.defaults.adapter = adapter;

    return httpClient;
}

/** Builds a success response with the given body. */
function ok(config: InternalAxiosRequestConfig, data: unknown): AxiosResponse {
    return { data, status: 200, statusText: 'OK', headers: {}, config };
}

/** Rejects the request as Axios does when the backend answers with an error status. */
function errorResponse(config: InternalAxiosRequestConfig, status: number, data: unknown): Promise<never> {
    const response = { data, status, statusText: '', headers: {}, config };
    return Promise.reject(new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, {}, response));
}

describe('AxiosHttpClient', () => {
    test('applies the configuration and the defaults to the Axios instance', () => {
        const defaults = new AxiosHttpClient({ baseURL: 'http://api.test' });
        expect(defaults.axiosInstance.defaults.baseURL).toBe('http://api.test');
        expect(defaults.axiosInstance.defaults.timeout).toBe(DEFAULT_TIMEOUT_MS);
        expect(defaults.axiosInstance.defaults.withCredentials).toBe(false);

        const custom = new AxiosHttpClient({ baseURL: 'http://x', timeout: 10, withCredentials: true });
        expect(custom.axiosInstance.defaults.timeout).toBe(10);
        expect(custom.axiosInstance.defaults.withCredentials).toBe(true);
    });

    test.each(['get', 'delete'] as const)('%s returns the response body', async method => {
        const httpClient = client(async config => ok(config, { method: config.method, url: config.url }));

        await expect(httpClient[method]('/region')).resolves.toEqual({ method, url: '/region' });
    });

    test.each(['post', 'put', 'patch'] as const)('%s sends the data in the body', async method => {
        const httpClient = client(async config => ok(config, JSON.parse(config.data)));

        await expect(httpClient[method]('/region', { name: 'North' })).resolves.toEqual({ name: 'North' });
    });

    test('converts the error response of the backend into an ApiError, with the message and the code', async () => {
        const httpClient = client(config => errorResponse(config, 409, { message: 'Conflict', code: 'CONCURRENT' }));

        const error = await httpClient.get('/region').catch((e: unknown) => e);
        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ message: 'Conflict', code: 'CONCURRENT' });
    });

    test('uses a generic message, in the locale, when the error body has no message', async () => {
        const failing: AxiosAdapter = config => errorResponse(config, 500, 'failed');

        await expect(client(failing).get('/region')).rejects.toMatchObject({ message: 'Unknown error' });
        await expect(client(failing, { locale: 'pt-BR' }).get('/region')).rejects.toMatchObject({
            message: 'Erro desconhecido'
        });
        await expect(client(failing, { messages: { unknownError: 'Oops' } }).get('/region')).rejects.toMatchObject({
            message: 'Oops'
        });
    });

    test('uses the given errorParser, for backends with another error format', async () => {
        const httpClient = client(config => errorResponse(config, 400, { failure: { text: 'Invalid', id: 'X' } }), {
            errorParser: body => {
                const { failure } = body as { failure: { text: string; id: string } };
                return { message: failure.text, code: failure.id };
            }
        });

        await expect(httpClient.get('/region')).rejects.toMatchObject({ message: 'Invalid', code: 'X' });
    });

    test('tells when the request was sent, but there was no response', async () => {
        const httpClient = client(config =>
            Promise.reject(new AxiosError('timeout', 'ECONNABORTED', config, { sent: true }))
        );

        const error = await httpClient.get('/region').catch((e: unknown) => e);
        expect(error).not.toBeInstanceOf(ApiError);
        expect(error).toMatchObject({ message: 'No response received' });
    });

    test('passes on the Axios message when the request was not even sent', async () => {
        const httpClient = client(config => Promise.reject(new AxiosError('Invalid URL', 'ERR_INVALID_URL', config)));

        await expect(httpClient.get('/region')).rejects.toMatchObject({ message: 'Invalid URL' });
    });
});

describe('parseErrorBody', () => {
    test('reads message and code from an object and ignores bodies that are not objects', () => {
        expect(parseErrorBody({ message: 'Error', code: 'X' })).toEqual({ message: 'Error', code: 'X' });
        expect(parseErrorBody({ other: 1 })).toEqual({ message: undefined, code: undefined });
        expect(parseErrorBody(null)).toEqual({});
        expect(parseErrorBody('text')).toEqual({});
    });
});
