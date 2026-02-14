import {
    API_BASE,
    STATION_TOKEN,
    HIGH_CERTAINTY_LEVELS,
    CONFIDENCE_THRESHOLD
} from '../config/constants.js';
import { fetchWithErrorHandling } from './client.js';
import { fetchStationInfo } from './station.js';

/**
 * Fetch bird detections from BirdWeather API
 * @param {number} hoursAgo - How many hours back to fetch (default: 24)
 * @returns {Promise<{detections: Array, stationInfo: object|null, error: Error|null}>}
 */
export async function fetchDetections(hoursAgo = 24) {
    const now = new Date();
    const fromDateTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const fromDateISO = fromDateTime.toISOString();

    const url = `${API_BASE}/stations/${STATION_TOKEN}/detections?limit=100&from=${fromDateISO}`;

    // Fetch station info and detections in parallel
    const [stationResult, detectionsResult] = await Promise.all([
        fetchStationInfo(),
        fetchWithErrorHandling(url, { priority: 'high' })
    ]);

    if (detectionsResult.error) {
        return {
            detections: [],
            stationInfo: stationResult.data,
            error: detectionsResult.error
        };
    }

    const data = detectionsResult.data;

    if (!data.success || !data.detections) {
        return {
            detections: [],
            stationInfo: stationResult.data,
            error: new Error('Invalid response from API')
        };
    }

    // Filter detections (reuse fromDateTime computed above)
    const filteredDetections = data.detections.filter(d => {
        const detectionDate = new Date(d.timestamp);
        const isRecent = detectionDate >= fromDateTime;
        const isHighCertainty = HIGH_CERTAINTY_LEVELS.includes(d.certainty);
        const isHighConfidence = (d.confidence || 0) >= CONFIDENCE_THRESHOLD;
        return isRecent && isHighCertainty && isHighConfidence;
    });

    return {
        detections: filteredDetections,
        rawDetections: data.detections, // Include raw detections for location data
        stationInfo: stationResult.data,
        error: null
    };
}

/**
 * Group detections by species
 * @param {Array} detections - Array of detection objects
 * @returns {Map} Map of speciesId -> { species, detections }
 */
export function groupDetectionsBySpecies(detections) {
    const speciesMap = new Map();

    detections.forEach(detection => {
        const speciesId = detection.species?.id;
        if (!speciesId) return;

        if (!speciesMap.has(speciesId)) {
            speciesMap.set(speciesId, {
                species: detection.species,
                detections: []
            });
        }

        speciesMap.get(speciesId).detections.push(detection);
    });

    return speciesMap;
}

/**
 * Sort species data for display
 * @param {Map} speciesMap - Map from groupDetectionsBySpecies
 * @param {string} sortMode - 'recent' or 'count'
 * @returns {Array} Sorted array of { species, detections }
 */
export function sortSpeciesData(speciesMap, sortMode = 'recent') {
    const speciesArray = Array.from(speciesMap.values());

    if (sortMode === 'count') {
        // Sort by detection count (descending)
        return speciesArray.sort((a, b) => b.detections.length - a.detections.length);
    }

    // Sort by most recent detection (default)
    return speciesArray.sort((a, b) => {
        const aLatest = new Date(a.detections[0]?.timestamp || 0);
        const bLatest = new Date(b.detections[0]?.timestamp || 0);
        return bLatest - aLatest;
    });
}
