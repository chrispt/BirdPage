import { API_BASE, STATION_TOKEN } from '../config/constants.js';
import { fetchWithErrorHandling } from './client.js';

/**
 * Fetch station information from BirdWeather API
 * @returns {Promise<{data: object|null, error: Error|null}>}
 */
export async function fetchStationInfo() {
    const url = `${API_BASE}/stations/${STATION_TOKEN}`;

    const { data, error } = await fetchWithErrorHandling(url);

    if (error) {
        console.error('Error fetching station info:', error);
        return { data: null, error };
    }

    return { data, error: null };
}
