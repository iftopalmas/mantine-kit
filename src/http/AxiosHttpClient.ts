import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import { HttpMessages } from '../i18n/KitMessages';
import { resolveMessages } from '../i18n/resolveMessages';
import { ApiError } from './ApiError';
import { AxiosHttpClientConfig, DEFAULT_TIMEOUT_MS, ParsedApiError, parseErrorBody } from './AxiosHttpClientConfig';

/**
 * HTTP client of a REST API, on top of Axios. It centralizes the error handling: converts backend errors into an
 * {@link ApiError}, with the user-friendly message and the error code, and network errors into a plain `Error`.
 */
export class AxiosHttpClient {
    private readonly _axiosInstance: AxiosInstance;
    private readonly _errorParser: (body: unknown) => ParsedApiError;
    private readonly _messages: HttpMessages;

    constructor(config: AxiosHttpClientConfig) {
        this._axiosInstance = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout ?? DEFAULT_TIMEOUT_MS,
            withCredentials: config.withCredentials ?? false,
            headers: config.headers
        });
        this._errorParser = config.errorParser ?? parseErrorBody;
        this._messages = resolveMessages(config.locale, { http: config.messages }).http;
    }

    /** Axios instance used in the requests, so the app can register interceptors (e.g. the authentication token). */
    public get axiosInstance(): AxiosInstance {
        return this._axiosInstance;
    }

    private async _handleRequest<T>(
        method: string,
        path: string,
        data?: unknown,
        options?: AxiosRequestConfig
    ): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this._axiosInstance.request<T>({
                method,
                url: path,
                data,
                ...options
            });

            return response.data;
        } catch (error) {
            throw this._handleError(error as AxiosError);
        }
    }

    private _handleError(error: AxiosError): Error {
        if (axios.isAxiosError(error) && error.response) {
            const { message, code } = this._errorParser(error.response.data);
            return new ApiError(message || this._messages.unknownError, code);
        }

        if (error.request) {
            return new Error(this._messages.noResponse);
        }

        return new Error(error.message || this._messages.requestFailed);
    }

    public async post<T>(path: string, data?: unknown, options?: AxiosRequestConfig): Promise<T> {
        return this._handleRequest<T>('post', path, data, options);
    }

    public async get<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
        return this._handleRequest<T>('get', path, undefined, options);
    }

    public async put<T>(path: string, data?: unknown, options?: AxiosRequestConfig): Promise<T> {
        return this._handleRequest<T>('put', path, data, options);
    }

    public async patch<T>(path: string, data?: unknown, options?: AxiosRequestConfig): Promise<T> {
        return this._handleRequest<T>('patch', path, data, options);
    }

    public async delete<T>(path: string, options?: AxiosRequestConfig): Promise<T> {
        return this._handleRequest<T>('delete', path, undefined, options);
    }
}
