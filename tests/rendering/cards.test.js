// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { getScoreInfo } from '../../src/rendering/cards.js';

describe('getScoreInfo', () => {
    it('returns Excellent for score >= 8.0', () => {
        const result = getScoreInfo(9.3);
        expect(result.label).toBe('Excellent');
        expect(result.color).toBe('#3a7d5c');
    });

    it('returns Excellent for exactly 8.0', () => {
        const result = getScoreInfo(8.0);
        expect(result.label).toBe('Excellent');
    });

    it('returns Good for score >= 6.0 and < 8.0', () => {
        const result = getScoreInfo(7.0);
        expect(result.label).toBe('Good');
        expect(result.color).toBe('#5ba87a');
    });

    it('returns Good for exactly 6.0', () => {
        const result = getScoreInfo(6.0);
        expect(result.label).toBe('Good');
    });

    it('returns Fair for score >= 4.0 and < 6.0', () => {
        const result = getScoreInfo(5.0);
        expect(result.label).toBe('Fair');
        expect(result.color).toBe('#c4873a');
    });

    it('returns Poor for score < 4.0', () => {
        const result = getScoreInfo(2.5);
        expect(result.label).toBe('Poor');
        expect(result.color).toBe('#a8a8a8');
    });

    it('returns Poor for score of 0', () => {
        const result = getScoreInfo(0);
        expect(result.label).toBe('Poor');
    });
});
