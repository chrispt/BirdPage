// API Configuration
export const STATION_TOKEN = 'mxrqeMuQJYrXp2NeQRcfEnLB';
export const API_BASE = 'https://app.birdweather.com/api/v1';
export const PUSHOVER_API_URL = 'https://api.pushover.net/1/messages.json';

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

export function getCornellGuideUrl(commonName) {
    const slug = commonName.replace(/\s+/g, '_');
    return `${CORNELL_BASE_URL}/${slug}`;
}

export function getCornellSoundsUrl(commonName) {
    const slug = commonName.replace(/\s+/g, '_');
    return `${CORNELL_BASE_URL}/${slug}/sounds`;
}

export function getCornellMapUrl(commonName) {
    const slug = commonName.replace(/\s+/g, '_');
    return `${CORNELL_BASE_URL}/${slug}/maps-range`;
}
