import { describe, it, expect } from 'vitest';
import {
    getStateFromCoordinates,
    resolveStateFromCoordinates,
    formatLocationDisplay,
    getStateFromStationDescription,
    getStationCoordinates,
    resolveLocationDisplay
} from '../../src/utils/location.js';

// Real coordinates for cities near state borders, where bounding boxes overlap
const PENNSYLVANIA_CITIES = {
    'State College': [40.79, -77.86],
    'Scranton': [41.41, -75.66],
    'Allentown': [40.60, -75.49],
    'Erie': [42.13, -80.09],
    'Pittsburgh': [40.44, -79.99],
    'Harrisburg': [40.27, -76.88],
    'Philadelphia': [39.95, -75.17],
    'Easton': [40.69, -75.21]
};

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

    it('prefers the smaller box when bounding boxes overlap', () => {
        // State College sits inside both the New York and Pennsylvania boxes
        expect(getStateFromCoordinates(40.79, -77.86)).toBe('Pennsylvania');
        // Washington, D.C. sits inside the Maryland and Virginia boxes
        expect(getStateFromCoordinates(38.9, -77.03)).toBe('Washington, D.C.');
    });

    it('returns null for coordinates outside US', () => {
        expect(getStateFromCoordinates(51.5, -0.12)).toBeNull(); // London
    });

    it('returns null for ocean coordinates', () => {
        expect(getStateFromCoordinates(0, 0)).toBeNull();
    });
});

describe('resolveStateFromCoordinates', () => {
    for (const [city, [lat, lon]] of Object.entries(PENNSYLVANIA_CITIES)) {
        it(`returns Pennsylvania for ${city}`, async () => {
            expect(await resolveStateFromCoordinates(lat, lon)).toBe('Pennsylvania');
        });
    }

    it('returns neighbouring states correctly near the Pennsylvania border', async () => {
        expect(await resolveStateFromCoordinates(40.71, -74.01)).toBe('New York'); // NYC
        expect(await resolveStateFromCoordinates(40.22, -74.76)).toBe('New Jersey'); // Trenton
        expect(await resolveStateFromCoordinates(39.74, -75.55)).toBe('Delaware'); // Wilmington
    });

    it('still resolves states with no overlap issues', async () => {
        expect(await resolveStateFromCoordinates(25.76, -80.19)).toBe('Florida');
        expect(await resolveStateFromCoordinates(29.76, -95.37)).toBe('Texas');
        expect(await resolveStateFromCoordinates(34.05, -118.24)).toBe('California');
    });

    it('falls back to bounding boxes for areas without a polygon', async () => {
        expect(await resolveStateFromCoordinates(38.9, -77.03)).toBe('Washington, D.C.');
    });

    it('returns null outside the US or for invalid input', async () => {
        expect(await resolveStateFromCoordinates(51.5, -0.12)).toBeNull();
        expect(await resolveStateFromCoordinates(0, 0)).toBeNull();
        expect(await resolveStateFromCoordinates(null, -77.86)).toBeNull();
        expect(await resolveStateFromCoordinates(NaN, NaN)).toBeNull();
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

describe('getStateFromStationDescription', () => {
    it('parses the state from "State, Country" descriptions', () => {
        expect(getStateFromStationDescription('Pennsylvania, United States')).toBe('Pennsylvania');
        expect(getStateFromStationDescription('  new york , United States')).toBe('New York');
    });

    it('rejects descriptions that are not a US state', () => {
        expect(getStateFromStationDescription('Backyard PUC')).toBeNull();
        expect(getStateFromStationDescription('Ontario, Canada')).toBeNull();
    });

    it('returns null for empty or missing descriptions', () => {
        expect(getStateFromStationDescription('')).toBeNull();
        expect(getStateFromStationDescription('   ')).toBeNull();
        expect(getStateFromStationDescription(null)).toBeNull();
        expect(getStateFromStationDescription(undefined)).toBeNull();
        expect(getStateFromStationDescription(42)).toBeNull();
    });
});

describe('getStationCoordinates', () => {
    it('reads nested coords', () => {
        expect(getStationCoordinates({ coords: { lat: 40.79, lon: -77.86 } }))
            .toEqual({ lat: 40.79, lon: -77.86 });
    });

    it('reads top-level lat/lon', () => {
        expect(getStationCoordinates({ lat: '40.79', lon: '-77.86' }))
            .toEqual({ lat: 40.79, lon: -77.86 });
    });

    it('returns null when coordinates are missing or invalid', () => {
        expect(getStationCoordinates(null)).toBeNull();
        expect(getStationCoordinates({})).toBeNull();
        expect(getStationCoordinates({ coords: { lat: null, lon: null } })).toBeNull();
        expect(getStationCoordinates({ lat: 'abc', lon: 'def' })).toBeNull();
    });
});

describe('resolveLocationDisplay', () => {
    const paDetection = { lat: 40.79, lon: -77.86 };

    it('prefers the station description when it names a state', async () => {
        const stationInfo = { description: 'Pennsylvania, United States' };
        expect(await resolveLocationDisplay(stationInfo, [{ lat: 40.71, lon: -74.01 }]))
            .toBe('Live from Pennsylvania');
    });

    it('uses station coordinates when the description is empty', async () => {
        const stationInfo = { description: '', coords: { lat: 41.41, lon: -75.66 } };
        expect(await resolveLocationDisplay(stationInfo, [{ lat: 40.71, lon: -74.01 }]))
            .toBe('Live from Pennsylvania');
    });

    it('accepts a station record nested under a "station" key', async () => {
        const stationInfo = { station: { description: 'Pennsylvania, United States' } };
        expect(await resolveLocationDisplay(stationInfo, [])).toBe('Live from Pennsylvania');
    });

    it('falls back to the most recent detection with coordinates', async () => {
        const stationInfo = { description: '', latestDetectionAt: '2026-09-07 08:55:00 -0400' };
        const detections = [{ lat: null, lon: null }, paDetection];
        expect(await resolveLocationDisplay(stationInfo, detections)).toBe('Live from Pennsylvania');
    });

    it('resolves Pennsylvania from a detection that the old bounding box lookup called New York', async () => {
        expect(await resolveLocationDisplay(null, [{ lat: 41.41, lon: -75.66 }]))
            .toBe('Live from Pennsylvania');
    });

    it('returns unavailable when nothing provides a location', async () => {
        expect(await resolveLocationDisplay(null, [])).toBe('Location unavailable');
        expect(await resolveLocationDisplay({ description: '' }, undefined)).toBe('Location unavailable');
        expect(await resolveLocationDisplay(null, [{ lat: 0, lon: 0 }])).toBe('Location unavailable');
    });
});
