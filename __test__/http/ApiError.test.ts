import { describe, expect, test } from '@jest/globals';

import { ApiError } from '@/src/http/ApiError';

describe('ApiError', () => {
    test('keeps the given message and code', () => {
        const error = new ApiError<'CONCURRENT_UPDATE'>('Conflict', 'CONCURRENT_UPDATE');
        expect(error.message).toBe('Conflict');
        expect(error.code).toBe('CONCURRENT_UPDATE');
        expect(error.name).toBe('ApiError');
        expect(error).toBeInstanceOf(Error);
    });

    test('code is undefined when not given', () => {
        const error = new ApiError('Generic error');
        expect(error.code).toBeUndefined();
    });
});
