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
export const SCORE_THRESHOLD = 7.0; // Minimum BirdWeather composite score (0-10)
export const HIGH_CERTAINTY_LEVELS = ['almost_certain', 'highly_likely', 'likely'];

// Score Display Configuration (BirdWeather composite score, 0-10 scale)
export const SCORE_TIERS = {
    EXCELLENT: { min: 8.0, label: 'Excellent', color: '#3a7d5c' },
    GOOD: { min: 7.0, label: 'Good', color: '#5ba87a' },
    FAIR: { min: 4.0, label: 'Fair', color: '#c4873a' },
    POOR: { min: 0, label: 'Poor', color: '#a8a8a8' }
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
