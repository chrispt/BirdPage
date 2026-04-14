import { API_BASE, STATION_TOKEN } from '../config/constants.js';
import { fetchWithErrorHandling } from './client.js';

const DELAY_MS = 300;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch historical detections for a specific species using sliding 24-hour windows.
 * Makes one API request per day going back `days` days.
 *
 * @param {string} speciesId - The species ID to filter for
 * @param {Object} options
 * @param {number} options.days - Number of days to look back (default: 7)
 * @param {AbortSignal} options.signal - AbortController signal for cancellation
 * @param {function} options.onProgress - Called with (completedRequests, totalRequests)
 * @returns {Promise<{detections: Array, possibleTruncation: boolean}>}
 */
export async function fetchHistoricalDetections(speciesId, { days = 7, signal, onProgress } = {}) {
    const allDetections = [];
    let possibleTruncation = false;
    const now = new Date();

    for (let dayOffset = 0; dayOffset < days; dayOffset++) {
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        const windowStart = new Date(now.getTime() - (dayOffset + 1) * 24 * 60 * 60 * 1000);
        const windowEnd = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
        const fromISO = windowStart.toISOString();
        const url = `${API_BASE}/stations/${STATION_TOKEN}/detections?limit=100&from=${fromISO}`;

        const { data, error } = await fetchWithErrorHandling(url, {
            signal,
            priority: 'low'
        });

        if (error) {
            // If aborted, re-throw so callers can distinguish
            if (error.message?.includes('abort')) {
                throw new DOMException('Aborted', 'AbortError');
            }
            // Skip failed windows but continue
            console.warn(`Historical fetch failed for day -${dayOffset + 1}:`, error.message);
            onProgress?.(dayOffset + 1, days);
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

        onProgress?.(dayOffset + 1, days);

        // Polite delay between requests (skip after last)
        if (dayOffset < days - 1) {
            await delay(DELAY_MS);
        }
    }

    return { detections: allDetections, possibleTruncation };
}
