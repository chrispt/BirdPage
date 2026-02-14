// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { getConfidenceInfo } from '../../src/rendering/cards.js';

describe('getConfidenceInfo', () => {
    it('returns Excellent for >= 90%', () => {
        const result = getConfidenceInfo(0.95);
        expect(result.label).toBe('Excellent');
        expect(result.color).toBe('#4caf50');
    });

    it('returns Excellent for exactly 90%', () => {
        const result = getConfidenceInfo(0.9);
        expect(result.label).toBe('Excellent');
    });

    it('returns Good for >= 75% and < 90%', () => {
        const result = getConfidenceInfo(0.85);
        expect(result.label).toBe('Good');
        expect(result.color).toBe('#4ecca3');
    });

    it('returns Good for exactly 75%', () => {
        const result = getConfidenceInfo(0.75);
        expect(result.label).toBe('Good');
    });

    it('returns Fair for < 75%', () => {
        const result = getConfidenceInfo(0.5);
        expect(result.label).toBe('Fair');
        expect(result.color).toBe('#ffc107');
    });

    it('returns Fair for 0%', () => {
        const result = getConfidenceInfo(0);
        expect(result.label).toBe('Fair');
    });
});
