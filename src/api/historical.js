import { API_BASE, STATION_TOKEN } from '../config/constants.js';
import { fetchWithErrorHandling } from './client.js';

const DELAY_MS = 300;
const WINDOW_HOURS = 12;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch historical detections for a specific species using sliding time windows.
 * Uses 12-hour windows to stay under the API's 100-result cap per request.
 *
 * @param {string} speciesId - The species ID to filter for
 * @param {Object} options
 * @param {number} options.days - Number of days to look back (default: 14)
 * @param {AbortSignal} options.signal - AbortController signal for cancellation
 * @param {function} options.onProgress - Called with (completedRequests, totalRequests)
 * @returns {Promise<{detections: Array, possibleTruncation: boolean}>}
 */
export async function fetchHistoricalDetections(speciesId, { days = 14, signal, onProgress } = {}) {
    const allDetections = [];
    let possibleTruncation = false;
    const now = new Date();

    const totalWindows = days * (24 / WINDOW_HOURS);

    for (let windowIndex = 0; windowIndex < totalWindows; windowIndex++) {
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        const windowStart = new Date(now.getTime() - (windowIndex + 1) * WINDOW_HOURS * 60 * 60 * 1000);
        const windowEnd = new Date(now.getTime() - windowIndex * WINDOW_HOURS * 60 * 60 * 1000);
        const fromISO = windowStart.toISOString();
        const url = `${API_BASE}/stations/${STATION_TOKEN}/detections?limit=100&from=${fromISO}`;

        const { data, error } = await fetchWithErrorHandling(url, {
            signal,
            priority: 'low'
        });

        if (error) {
            if (error.message?.includes('abort')) {
                throw new DOMException('Aborted', 'AbortError');
            }
            console.warn(`Historical fetch failed for window ${windowIndex + 1}:`, error.message);
            onProgress?.(windowIndex + 1, totalWindows);
            continue;
        }

        if (data?.success && data.detections) {
            if (data.detections.length === 100) {
                possibleTruncation = true;
            }

            // Filter to target species AND this specific time window
            // (API has no `to` param, so each request returns everything from `from` onward)
            const speciesDetections = data.detections.filter(d => {
                if (d.species?.id !== speciesId) return false;
                const t = new Date(d.timestamp);
                return t >= windowStart && t < windowEnd;
            });
            allDetections.push(...speciesDetections);
        }

        onProgress?.(windowIndex + 1, totalWindows);

        // Polite delay between requests (skip after last)
        if (windowIndex < totalWindows - 1) {
            await delay(DELAY_MS);
        }
    }

    return { detections: allDetections, possibleTruncation };
}
