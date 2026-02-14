import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithErrorHandling, sanitizeErrorMessage, ApiError } from '../../src/api/client.js';

describe('sanitizeErrorMessage', () => {
    it('escapes HTML tags', () => {
        expect(sanitizeErrorMessage('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('escapes ampersands', () => {
        expect(sanitizeErrorMessage('foo & bar')).toBe('foo &amp; bar');
    });

    it('escapes quotes', () => {
        expect(sanitizeErrorMessage('"hello" & \'world\'')).toBe('&quot;hello&quot; &amp; &#039;world&#039;');
    });

    it('returns default for non-string input', () => {
        expect(sanitizeErrorMessage(null)).toBe('An unknown error occurred');
        expect(sanitizeErrorMessage(undefined)).toBe('An unknown error occurred');
        expect(sanitizeErrorMessage(123)).toBe('An unknown error occurred');
    });
});

describe('ApiError', () => {
    it('creates error with message and status', () => {
        const err = new ApiError('Not Found', 404);
        expect(err.message).toBe('Not Found');
        expect(err.status).toBe(404);
        expect(err.name).toBe('ApiError');
    });

    it('defaults status to 0', () => {
        const err = new ApiError('Network error');
        expect(err.status).toBe(0);
    });
});

describe('fetchWithErrorHandling', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('returns data on successful response', async () => {
        const mockData = { success: true, detections: [] };
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockData)
        });

        const result = await fetchWithErrorHandling('https://example.com/api');
        expect(result.data).toEqual(mockData);
        expect(result.error).toBeNull();
    });

    it('returns ApiError on HTTP error', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            statusText: 'Not Found'
        });

        const result = await fetchWithErrorHandling('https://example.com/api');
        expect(result.data).toBeNull();
        expect(result.error).toBeInstanceOf(ApiError);
        expect(result.error.status).toBe(404);
    });

    it('returns ApiError on network error', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

        const result = await fetchWithErrorHandling('https://example.com/api');
        expect(result.data).toBeNull();
        expect(result.error).toBeInstanceOf(ApiError);
        expect(result.error.message).toBe('Network failure');
    });

    it('merges custom headers with defaults', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });

        await fetchWithErrorHandling('https://example.com/api', {
            headers: { 'X-Custom': 'test' }
        });

        const callOptions = global.fetch.mock.calls[0][1];
        expect(callOptions.headers['Accept']).toBe('application/json');
        expect(callOptions.headers['X-Custom']).toBe('test');
    });
});
