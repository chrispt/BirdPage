import { describe, it, expect } from 'vitest';
import { groupDetectionsBySpecies, sortSpeciesData } from '../../src/api/detections.js';

describe('groupDetectionsBySpecies', () => {
    it('groups detections by species id', () => {
        const detections = [
            { species: { id: 1, common_name: 'Robin' }, timestamp: '2026-01-01T10:00:00Z' },
            { species: { id: 2, common_name: 'Cardinal' }, timestamp: '2026-01-01T11:00:00Z' },
            { species: { id: 1, common_name: 'Robin' }, timestamp: '2026-01-01T12:00:00Z' },
        ];

        const result = groupDetectionsBySpecies(detections);
        expect(result.size).toBe(2);
        expect(result.get(1).detections.length).toBe(2);
        expect(result.get(2).detections.length).toBe(1);
    });

    it('handles empty array', () => {
        const result = groupDetectionsBySpecies([]);
        expect(result.size).toBe(0);
    });

    it('skips detections without species id', () => {
        const detections = [
            { species: { common_name: 'Robin' }, timestamp: '2026-01-01T10:00:00Z' },
            { species: { id: 1, common_name: 'Cardinal' }, timestamp: '2026-01-01T11:00:00Z' },
        ];

        const result = groupDetectionsBySpecies(detections);
        expect(result.size).toBe(1);
    });
});

describe('sortSpeciesData', () => {
    // Use groupDetectionsBySpecies to build the Map so latestTimestamp is computed
    const createMap = () => {
        return groupDetectionsBySpecies([
            { species: { id: 1 }, timestamp: '2026-01-01T10:00:00Z', confidence: 0.8 },
            { species: { id: 1 }, timestamp: '2026-01-01T11:00:00Z', confidence: 0.9 },
            { species: { id: 2 }, timestamp: '2026-01-01T12:00:00Z', confidence: 0.7 },
        ]);
    };

    it('sorts by count descending', () => {
        const result = sortSpeciesData(createMap(), 'count');
        expect(result[0].detections.length).toBe(2);
        expect(result[1].detections.length).toBe(1);
    });

    it('sorts by most recent detection by default', () => {
        const result = sortSpeciesData(createMap(), 'recent');
        // Species 2 has the most recent detection (12:00)
        expect(result[0].species.id).toBe(2);
    });
});
