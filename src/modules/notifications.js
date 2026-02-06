import { store } from '../state/store.js';
import { DOM } from '../utils/dom.js';
import { NOTIFICATION_AUTO_HIDE_MS } from '../config/constants.js';
import { sendPushoverNotification } from './pushover.js';

/**
 * Toggle browser notifications on/off (called from settings modal)
 */
export function toggleNotifications() {
    const toggle = document.getElementById('notificationsEnabledToggle');
    const enabled = toggle ? toggle.checked : false;

    store.set('notificationsEnabled', enabled);

    // Request permission if enabling and not yet granted
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/**
 * Initialize notifications - request permission if already enabled
 */
export function initNotifications() {
    if (store.get('notificationsEnabled') && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/**
 * Check for new species in detections and notify
 */
export function checkForNewSpecies(detections) {
    if (!store.get('notificationsEnabled')) return;

    const currentSpeciesIds = new Set(
        detections.map(d => d.species?.id).filter(Boolean)
    );
    const previousSpeciesIds = store.get('previousSpeciesIds');

    // Check for new species not seen before
    currentSpeciesIds.forEach(speciesId => {
        if (!previousSpeciesIds.has(speciesId) && previousSpeciesIds.size > 0) {
            const detection = detections.find(d => d.species?.id === speciesId);
            if (detection) {
                const speciesName = detection.species?.common_name ||
                    detection.species?.commonName ||
                    'Unknown Bird';
                showNotification(
                    'New Species Detected!',
                    `A ${speciesName} was just spotted at the feeder!`
                );
            }
        }
    });

    // Update previous species set
    store.set('previousSpeciesIds', currentSpeciesIds);
}

/**
 * Check for watched species in detections and notify
 */
export function checkForWatchedSpecies(detections) {
    if (!store.get('notificationsEnabled')) return;

    const watchedSpeciesIds = store.get('watchedSpeciesIds');
    if (watchedSpeciesIds.size === 0) return;

    // Get current species IDs as strings for consistent comparison
    const currentSpeciesIds = new Set(
        detections.map(d => String(d.species?.id)).filter(id => id !== 'undefined')
    );

    const notifiedWatchedSpecies = store.get('notifiedWatchedSpecies');

    // Check each watched species
    watchedSpeciesIds.forEach(watchedId => {
        if (currentSpeciesIds.has(watchedId) && !notifiedWatchedSpecies.has(watchedId)) {
            const detection = detections.find(d => String(d.species?.id) === watchedId);
            if (detection) {
                const speciesName = detection.species?.common_name ||
                    detection.species?.commonName ||
                    'Unknown Bird';
                showNotification(
                    'Watched Bird Spotted!',
                    `${speciesName} is at the feeder!`
                );
                notifiedWatchedSpecies.add(watchedId);
            }
        }
    });

    store.set('notifiedWatchedSpecies', notifiedWatchedSpecies);
}

/**
 * Show a notification (in-page banner + browser + Pushover)
 */
export function showNotification(title, body) {
    // Show in-page banner
    const banner = DOM.notificationBanner || document.getElementById('notificationBanner');
    const titleEl = DOM.notificationTitle || document.getElementById('notificationTitle');
    const bodyEl = DOM.notificationBody || document.getElementById('notificationBody');

    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.textContent = body;
    if (banner) banner.classList.add('show');

    // Auto-hide after configured time
    setTimeout(() => {
        hideNotification();
    }, NOTIFICATION_AUTO_HIDE_MS);

    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body });
    }

    // Send to Pushover if enabled
    sendPushoverNotification(title, body);
}

/**
 * Hide the notification banner
 */
export function hideNotification() {
    const banner = DOM.notificationBanner || document.getElementById('notificationBanner');
    if (banner) {
        banner.classList.remove('show');
    }
}

/**
 * Clear notified watched species (call on new fetch cycle)
 */
export function clearNotifiedWatchedSpecies() {
    store.set('notifiedWatchedSpecies', new Set());
}
