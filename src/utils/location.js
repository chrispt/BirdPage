import { US_STATE_BOUNDING_BOXES } from '../config/states.js';

/**
 * Location utilities for reverse geocoding
 */

/**
 * Get US state name from coordinates using bounding box lookup
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string|null} State name or null if not found
 */
export function getStateFromCoordinates(lat, lon) {
    for (const state of US_STATE_BOUNDING_BOXES) {
        if (lat >= state.minLat && lat <= state.maxLat &&
            lon >= state.minLon && lon <= state.maxLon) {
            return state.name;
        }
    }
    return null;
}

/**
 * Format location display text
 * @param {number|null} lat - Latitude
 * @param {number|null} lon - Longitude
 * @returns {string} Formatted location text
 */
export function formatLocationDisplay(lat, lon) {
    if (lat == null || lon == null) {
        return 'Location unavailable';
    }

    const state = getStateFromCoordinates(lat, lon);

    if (state) {
        return `Live from ${state}`;
    }

    return 'Location unavailable';
}
