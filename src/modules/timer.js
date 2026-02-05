import { store } from '../state/store.js';
import { REFRESH_INTERVAL_SECONDS } from '../config/constants.js';
import { DOM } from '../utils/dom.js';

// Will be set by main.js to avoid circular dependency
let fetchDataCallback = null;

/**
 * Set the fetchData callback for when timer expires
 */
export function setFetchDataCallback(callback) {
    fetchDataCallback = callback;
}

/**
 * Update the countdown display
 */
export function updateCountdown() {
    let countdownSeconds = store.get('countdownSeconds');
    const el = DOM.countdown || document.getElementById('countdown');

    if (countdownSeconds <= 0) {
        if (el) el.textContent = 'Refreshing...';
        store.set('countdownSeconds', REFRESH_INTERVAL_SECONDS);

        // Trigger data fetch
        if (fetchDataCallback) {
            fetchDataCallback();
        }
    } else {
        const minutes = Math.floor(countdownSeconds / 60);
        const seconds = countdownSeconds % 60;

        if (el) {
            if (minutes > 0) {
                el.textContent = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
            } else {
                el.textContent = `${seconds}s`;
            }
        }

        store.set('countdownSeconds', countdownSeconds - 1);
    }
}

/**
 * Start or restart the countdown timer
 */
export function startCountdown() {
    const existingInterval = store.get('countdownInterval');

    if (existingInterval) {
        clearInterval(existingInterval);
    }

    store.set('countdownSeconds', REFRESH_INTERVAL_SECONDS);
    store.set('pageHiddenTime', null);

    const interval = setInterval(updateCountdown, 1000);
    store.set('countdownInterval', interval);
}

/**
 * Stop the countdown timer
 */
export function stopCountdown() {
    const interval = store.get('countdownInterval');
    if (interval) {
        clearInterval(interval);
        store.set('countdownInterval', null);
    }
}

/**
 * Handle page visibility changes for accurate timer when tab is backgrounded
 */
export function handleVisibilityChange() {
    if (document.hidden) {
        // Page is now hidden - record the time
        store.set('pageHiddenTime', Date.now());
    } else {
        // Page is now visible - check elapsed time
        const pageHiddenTime = store.get('pageHiddenTime');

        if (pageHiddenTime) {
            const elapsedSeconds = Math.floor((Date.now() - pageHiddenTime) / 1000);

            if (elapsedSeconds >= REFRESH_INTERVAL_SECONDS) {
                // 15+ minutes elapsed while hidden - refresh immediately
                if (fetchDataCallback) {
                    fetchDataCallback();
                }
            } else {
                // Adjust countdown to account for elapsed time
                let countdownSeconds = store.get('countdownSeconds');
                countdownSeconds = Math.max(0, countdownSeconds - elapsedSeconds);
                store.set('countdownSeconds', countdownSeconds);

                if (countdownSeconds <= 0) {
                    if (fetchDataCallback) {
                        fetchDataCallback();
                    }
                } else {
                    // Update the display immediately
                    updateCountdown();
                }
            }
        }
        store.set('pageHiddenTime', null);
    }
}
