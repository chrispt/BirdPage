import { US_STATE_BOUNDING_BOXES } from '../config/states.js';

/**
 * Location utilities for reverse geocoding
 *
 * Resolution order for the "Live from ..." label:
 *   1. The station's own location description from the BirdWeather station
 *      endpoint (e.g. "Pennsylvania, United States"). This is empty when the
 *      station has location privacy enabled.
 *   2. The station's own coordinates, if the station endpoint exposes them.
 *   3. The coordinates attached to the most recent detection.
 *
 * Coordinates are resolved to a state with a point-in-polygon test against
 * simplified state boundaries. The bounding-box table is only a fallback,
 * because state bounding boxes overlap heavily (most of northern Pennsylvania
 * sits inside New York's box, for example).
 */

const LOCATION_UNAVAILABLE = 'Location unavailable';

let boundariesPromise = null;

/**
 * Lazy-load the state boundary polygons so they stay out of the main bundle
 * @returns {Promise<Array<{name: string, polygons: number[][][][]}>>}
 */
function loadStateBoundaries() {
    if (!boundariesPromise) {
        boundariesPromise = import('../config/stateBoundaries.json')
            .then(module => (module.default || module).states)
            .catch(error => {
                console.error('Error loading state boundaries:', error);
                boundariesPromise = null;
                return [];
            });
    }
    return boundariesPromise;
}

/**
 * Ray-casting point-in-ring test
 * @param {number} lon
 * @param {number} lat
 * @param {number[][]} ring - Array of [lon, lat] pairs
 * @returns {boolean}
 */
function isPointInRing(lon, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        const crosses = (yi > lat) !== (yj > lat);
        if (crosses && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
}

/**
 * Point-in-polygon test honouring holes (first ring is the outer boundary)
 * @param {number} lon
 * @param {number} lat
 * @param {number[][][]} polygon - Array of rings
 * @returns {boolean}
 */
function isPointInPolygon(lon, lat, polygon) {
    if (!isPointInRing(lon, lat, polygon[0])) {
        return false;
    }
    for (let i = 1; i < polygon.length; i++) {
        if (isPointInRing(lon, lat, polygon[i])) {
            return false;
        }
    }
    return true;
}

/**
 * Get US state name from coordinates using bounding box lookup.
 * When several boxes contain the point, the smallest box wins, which
 * resolves most (but not all) overlaps between neighbouring states.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string|null} State name or null if not found
 */
export function getStateFromCoordinates(lat, lon) {
    let best = null;
    let bestArea = Infinity;

    for (const state of US_STATE_BOUNDING_BOXES) {
        if (lat >= state.minLat && lat <= state.maxLat &&
            lon >= state.minLon && lon <= state.maxLon) {
            const area = (state.maxLat - state.minLat) * (state.maxLon - state.minLon);
            if (area < bestArea) {
                best = state.name;
                bestArea = area;
            }
        }
    }

    return best;
}

/**
 * Resolve US state name from coordinates using state boundary polygons,
 * falling back to the bounding box lookup if no polygon contains the point.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<string|null>} State name or null if not found
 */
export async function resolveStateFromCoordinates(lat, lon) {
    if (!isValidCoordinate(lat, lon)) {
        return null;
    }

    const states = await loadStateBoundaries();

    for (const state of states) {
        if (state.polygons.some(polygon => isPointInPolygon(lon, lat, polygon))) {
            return state.name;
        }
    }

    return getStateFromCoordinates(lat, lon);
}

/**
 * @param {*} lat
 * @param {*} lon
 * @returns {boolean} True when both values are finite numbers
 */
function isValidCoordinate(lat, lon) {
    return Number.isFinite(lat) && Number.isFinite(lon);
}

/**
 * Format the label shown for a resolved state
 * @param {string|null} state
 * @returns {string}
 */
function formatStateLabel(state) {
    return state ? `Live from ${state}` : LOCATION_UNAVAILABLE;
}

/**
 * Format location display text from coordinates (synchronous bounding box lookup)
 * @param {number|null} lat - Latitude
 * @param {number|null} lon - Longitude
 * @returns {string} Formatted location text
 */
export function formatLocationDisplay(lat, lon) {
    if (lat == null || lon == null) {
        return LOCATION_UNAVAILABLE;
    }

    return formatStateLabel(getStateFromCoordinates(lat, lon));
}

/**
 * Extract the state name from a BirdWeather station description
 * such as "Pennsylvania, United States". Only known US state names are
 * accepted so a free-form description never becomes the label.
 * @param {string|null|undefined} description
 * @returns {string|null}
 */
export function getStateFromStationDescription(description) {
    if (typeof description !== 'string') {
        return null;
    }

    const candidate = description.split(',')[0].trim().toLowerCase();
    if (!candidate) {
        return null;
    }

    const match = US_STATE_BOUNDING_BOXES.find(state => state.name.toLowerCase() === candidate);
    return match ? match.name : null;
}

/**
 * Extract coordinates from a BirdWeather station record.
 * Accepts either a nested coords object or top-level lat/lon fields.
 * @param {object|null|undefined} stationInfo
 * @returns {{lat: number, lon: number}|null}
 */
export function getStationCoordinates(stationInfo) {
    if (!stationInfo) {
        return null;
    }

    const candidates = [stationInfo.coords, stationInfo];

    for (const source of candidates) {
        if (!source) continue;
        const lat = Number(source.lat ?? source.latitude);
        const lon = Number(source.lon ?? source.lng ?? source.longitude);
        if (isValidCoordinate(lat, lon)) {
            return { lat, lon };
        }
    }

    return null;
}

/**
 * Resolve the location label for the header, preferring the station's own
 * location and falling back to the most recent detection's coordinates.
 * @param {object|null} stationInfo - Station record from the BirdWeather API
 * @param {Array} rawDetections - Unfiltered detections, most recent first
 * @returns {Promise<string>} Formatted location text
 */
export async function resolveLocationDisplay(stationInfo, rawDetections = []) {
    const station = stationInfo?.station || stationInfo;

    const describedState = getStateFromStationDescription(station?.description);
    if (describedState) {
        return formatStateLabel(describedState);
    }

    let coords = getStationCoordinates(station);

    if (!coords) {
        const detection = (rawDetections || []).find(d => isValidCoordinate(d?.lat, d?.lon));
        if (detection) {
            coords = { lat: detection.lat, lon: detection.lon };
        }
    }

    if (!coords) {
        return LOCATION_UNAVAILABLE;
    }

    const state = await resolveStateFromCoordinates(coords.lat, coords.lon);
    return formatStateLabel(state);
}
