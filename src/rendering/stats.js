import { DOM } from '../utils/dom.js';
import { formatTime, formatRelativeTime, parseStationTimestamp } from '../utils/formatting.js';
import { formatLocationDisplay } from '../utils/location.js';
import { STALE_THRESHOLD_MINUTES, OFFLINE_THRESHOLD_MINUTES } from '../config/constants.js';

/**
 * Update the stats grid display
 */
export function updateStats(detections) {
    // Count unique species
    const uniqueSpeciesCount = new Set(detections.map(d => d.species?.id)).size;

    // Get latest detection time
    const latestDetection = detections[0];
    const latestTime = latestDetection
        ? formatTime(new Date(latestDetection.timestamp))
        : '--';

    // Get top confidence
    const topConfidence = detections.length > 0
        ? Math.max(...detections.map(d => d.confidence || 0))
        : 0;

    // Update DOM
    const totalDetectionsEl = DOM.totalDetections || document.getElementById('totalDetections');
    const uniqueSpeciesEl = DOM.uniqueSpecies || document.getElementById('uniqueSpecies');
    const latestTimeEl = DOM.latestTime || document.getElementById('latestTime');
    const topConfidenceEl = DOM.topConfidence || document.getElementById('topConfidence');

    if (totalDetectionsEl) {
        totalDetectionsEl.textContent = detections.length;
    }
    if (uniqueSpeciesEl) {
        uniqueSpeciesEl.textContent = uniqueSpeciesCount;
    }
    if (latestTimeEl) {
        latestTimeEl.textContent = latestTime;
    }
    if (topConfidenceEl) {
        topConfidenceEl.textContent = topConfidence > 0
            ? `${(topConfidence * 100).toFixed(0)}%`
            : '--';
    }
}

/**
 * Update the last update timestamp display
 */
export function updateLastUpdateTime() {
    const el = DOM.lastUpdate || document.getElementById('lastUpdate');
    if (el) {
        el.textContent = formatTime(new Date());
    }
}

/**
 * Update the PUC (BirdWeather device) status indicator
 */
export function updatePucStatus(latestDetectionAt) {
    const statusDot = DOM.pucStatusDot || document.getElementById('pucStatusDot');
    const statusLabel = DOM.pucStatusLabel || document.getElementById('pucStatusLabel');

    if (!statusDot || !statusLabel) return;

    if (!latestDetectionAt) {
        statusDot.className = 'status-dot offline';
        statusLabel.textContent = 'PUC Status Unknown';
        return;
    }

    const lastDetection = parseStationTimestamp(latestDetectionAt);
    if (!lastDetection) {
        statusDot.className = 'status-dot offline';
        statusLabel.textContent = 'PUC Status Unknown';
        return;
    }

    const now = new Date();
    const diffMinutes = (now - lastDetection) / (1000 * 60);

    statusDot.classList.remove('online', 'stale', 'offline');

    if (diffMinutes <= STALE_THRESHOLD_MINUTES) {
        statusDot.classList.add('online');
        statusLabel.textContent = 'PUC Online';
        statusLabel.title = `Last detection: ${formatRelativeTime(lastDetection)}`;
    } else if (diffMinutes <= OFFLINE_THRESHOLD_MINUTES) {
        statusDot.classList.add('stale');
        statusLabel.textContent = 'PUC Stale';
        statusLabel.title = `Last detection: ${formatRelativeTime(lastDetection)}`;
    } else {
        statusDot.classList.add('offline');
        statusLabel.textContent = 'PUC Offline';
        statusLabel.title = `Last detection: ${formatRelativeTime(lastDetection)}`;
    }
}

/**
 * Update the location display
 */
export function updateLocationDisplay(lat, lon) {
    const locationDisplay = DOM.locationDisplay || document.getElementById('locationDisplay');

    if (!locationDisplay) return;

    locationDisplay.textContent = formatLocationDisplay(lat, lon);
}
