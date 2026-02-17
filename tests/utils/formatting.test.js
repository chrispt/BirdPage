import { describe, it, expect } from 'vitest';
import { escapeHtml, formatTime, formatDateTime, formatRelativeTime, parseStationTimestamp } from '../../src/utils/formatting.js';

describe('escapeHtml', () => {
    it('escapes HTML entities', () => {
        expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('escapes ampersands', () => {
        expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
    });

    it('escapes single quotes', () => {
        expect(escapeHtml("it's")).toBe('it&#039;s');
    });

    it('returns empty string for non-string input', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
        expect(escapeHtml(123)).toBe('');
    });

    it('handles empty string', () => {
        expect(escapeHtml('')).toBe('');
    });

    it('passes through safe strings', () => {
        expect(escapeHtml('Northern Cardinal')).toBe('Northern Cardinal');
    });
});

describe('formatRelativeTime', () => {
    it('returns "Just now" for less than 1 minute', () => {
        const now = new Date();
        expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('returns minutes for less than 60 minutes', () => {
        const date = new Date(Date.now() - 5 * 60000);
        expect(formatRelativeTime(date)).toBe('5 mins ago');
    });

    it('returns singular "min" for 1 minute', () => {
        const date = new Date(Date.now() - 1 * 60000);
        expect(formatRelativeTime(date)).toBe('1 min ago');
    });

    it('returns hours for less than 24 hours', () => {
        const date = new Date(Date.now() - 3 * 3600000);
        expect(formatRelativeTime(date)).toBe('3 hours ago');
    });

    it('returns singular "hour" for 1 hour', () => {
        const date = new Date(Date.now() - 1 * 3600000);
        expect(formatRelativeTime(date)).toBe('1 hour ago');
    });

    it('returns formatted date for 24+ hours', () => {
        const date = new Date(Date.now() - 25 * 3600000);
        const result = formatRelativeTime(date);
        // Should be a date string, not "X hours ago"
        expect(result).not.toContain('hours ago');
    });
});

describe('parseStationTimestamp', () => {
    it('returns null for null input', () => {
        expect(parseStationTimestamp(null)).toBeNull();
    });

    it('returns null for empty string', () => {
        expect(parseStationTimestamp('')).toBeNull();
    });

    it('parses standard BirdWeather format', () => {
        const result = parseStationTimestamp('2026-01-13 at 08:49:09 EST');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2026);
    });

    it('parses fallback format with regex', () => {
        const result = parseStationTimestamp('2026-01-13 something 08:49:09');
        expect(result).toBeInstanceOf(Date);
    });
});
