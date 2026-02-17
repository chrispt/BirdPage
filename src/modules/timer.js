import { REFRESH_INTERVAL_SECONDS } from '../config/constants.js';
import { DOM } from '../utils/dom.js';

// Will be set by main.js to avoid circular dependency
let fetchDataCallback = null;

// Module-level timer state (avoids store read/write every second)
let countdownSeconds = REFRESH_INTERVAL_SECONDS;
let countdownInterval = null;
let pageHiddenTime = null;

/**
 * Set the fetchData callback for when timer expires
 */
export function setFetchDataCallback(callback) {
    fetchDataCallback = callback;
}

/**
 * Update the countdown DOM element without modifying state
 */
function displayCountdown() {
    const el = DOM.countdown || document.getElementById('countdown');
    if (!el) return;

    const minutes = Math.floor(countdownSeconds / 60);
    const seconds = countdownSeconds % 60;

    if (minutes > 0) {
        el.textContent = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    } else {
        el.textContent = `${seconds}s`;
    }
}

/**
 * Tick the countdown: display, then decrement
 */
function updateCountdown() {
    if (countdownSeconds <= 0) {
        const el = DOM.countdown || document.getElementById('countdown');
        if (el) el.textContent = 'Refreshing...';
        countdownSeconds = REFRESH_INTERVAL_SECONDS;

        if (fetchDataCallback) {
            fetchDataCallback();
        }
    } else {
        displayCountdown();
        countdownSeconds--;
    }
}

/**
 * Start or restart the countdown timer
 */
export function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    countdownSeconds = REFRESH_INTERVAL_SECONDS;
    pageHiddenTime = null;

    countdownInterval = setInterval(updateCountdown, 1000);
}

/**
 * Stop the countdown timer
 */
export function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

/**
 * Handle page visibility changes for accurate timer when tab is backgrounded
 */
export function handleVisibilityChange() {
    if (document.hidden) {
        // Page is now hidden - record the time
        pageHiddenTime = Date.now();
    } else {
        // Page is now visible - check elapsed time
        if (pageHiddenTime) {
            const elapsedSeconds = Math.floor((Date.now() - pageHiddenTime) / 1000);

            if (elapsedSeconds >= REFRESH_INTERVAL_SECONDS) {
                // 15+ minutes elapsed while hidden - refresh immediately
                if (fetchDataCallback) {
                    fetchDataCallback();
                }
            } else {
                // Adjust countdown to account for elapsed time
                countdownSeconds = Math.max(0, countdownSeconds - elapsedSeconds);

                if (countdownSeconds <= 0) {
                    if (fetchDataCallback) {
                        fetchDataCallback();
                    }
                } else {
                    // Update display only — don't decrement again
                    displayCountdown();
                }
            }
        }
        pageHiddenTime = null;
    }
}
