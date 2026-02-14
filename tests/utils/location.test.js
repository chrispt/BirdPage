import { describe, it, expect } from 'vitest';
import { getStateFromCoordinates, formatLocationDisplay } from '../../src/utils/location.js';

describe('getStateFromCoordinates', () => {
    it('returns Florida for Miami coordinates', () => {
        expect(getStateFromCoordinates(25.76, -80.19)).toBe('Florida');
    });

    it('returns Texas for Houston coordinates', () => {
        expect(getStateFromCoordinates(29.76, -95.37)).toBe('Texas');
    });

    it('returns California for LA coordinates', () => {
        expect(getStateFromCoordinates(34.05, -118.24)).toBe('California');
    });

    it('returns null for coordinates outside US', () => {
        expect(getStateFromCoordinates(51.5, -0.12)).toBeNull(); // London
    });

    it('returns null for ocean coordinates', () => {
        expect(getStateFromCoordinates(0, 0)).toBeNull();
    });
});

describe('formatLocationDisplay', () => {
    it('returns state-based text for valid coordinates', () => {
        const result = formatLocationDisplay(25.76, -80.19);
        expect(result).toBe('Live from Florida');
    });

    it('returns unavailable for null lat', () => {
        expect(formatLocationDisplay(null, -80.19)).toBe('Location unavailable');
    });

    it('returns unavailable for null lon', () => {
        expect(formatLocationDisplay(25.76, null)).toBe('Location unavailable');
    });

    it('returns unavailable for coordinates outside states', () => {
        expect(formatLocationDisplay(0, 0)).toBe('Location unavailable');
    });
});
