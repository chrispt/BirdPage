// API Configuration
export const STATION_TOKEN = import.meta.env.VITE_STATION_TOKEN || 'mxrqeMuQJYrXp2NeQRcfEnLB';
export const API_BASE = 'https://app.birdweather.com/api/v1';
export const PUSHOVER_API_URL = 'https://api.pushover.net/1/messages.json';

// Image Fallback (inline SVG avoids external dependency)
export const IMAGE_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect fill='%23f0f0f0' width='400' height='200'/%3E%3Ctext x='200' y='105' text-anchor='middle' fill='%23999' font-family='system-ui,sans-serif' font-size='14'%3ENo Image Available%3C/text%3E%3C/svg%3E";

// Timing Configuration
export const REFRESH_INTERVAL_SECONDS = 15 * 60; // 15 minutes
export const NOTIFICATION_AUTO_HIDE_MS = 5000; // 5 seconds

// PUC Status Thresholds (in minutes)
export const STALE_THRESHOLD_MINUTES = 30;
export const OFFLINE_THRESHOLD_MINUTES = 60;

// Detection Filtering
export const CONFIDENCE_THRESHOLD = 0.75; // 75%
export const HIGH_CERTAINTY_LEVELS = ['almost_certain', 'highly_likely', 'likely'];

// Confidence Level Display Configuration
export const CONFIDENCE_LEVELS = {
    ALMOST_CERTAIN: { min: 0.9, label: 'Almost Certain', color: '#4ecca3' },
    HIGHLY_LIKELY: { min: 0.75, label: 'Highly Likely', color: '#45b7aa' },
    LIKELY: { min: 0.5, label: 'Likely', color: '#f59e0b' },
    UNCERTAIN: { min: 0, label: 'Uncertain', color: '#a8a8a8' }
};

// LocalStorage Keys
export const STORAGE_KEYS = {
    NOTIFICATIONS_ENABLED: 'notificationsEnabled',
    NIGHT_MODE_ENABLED: 'nightModeEnabled',
    WATCHED_SPECIES_IDS: 'watchedSpeciesIds',
    PUSHOVER_ENABLED: 'pushoverEnabled',
    PUSHOVER_USER_KEY: 'pushoverUserKey',
    PUSHOVER_APP_TOKEN: 'pushoverAppToken',
    WHATS_NEW_DISMISSED: 'whatsNewDismissed'
};

// Cornell All About Birds URLs
export const CORNELL_BASE_URL = 'https://www.allaboutbirds.org/guide';

function toSlug(name) {
    return name.replace(/\s+/g, '_');
}

export function getCornellGuideUrl(commonName) {
    return `${CORNELL_BASE_URL}/${toSlug(commonName)}`;
}

export function getCornellSoundsUrl(commonName) {
    return `${CORNELL_BASE_URL}/${toSlug(commonName)}/sounds`;
}

export function getCornellMapUrl(commonName) {
    return `${CORNELL_BASE_URL}/${toSlug(commonName)}/maps-range`;
}
