import { store } from '../state/store.js';
import { PUSHOVER_API_URL } from '../config/constants.js';
import { DOM } from '../utils/dom.js';

/**
 * Send a notification via Pushover API
 * Shows user-facing error if notification fails
 */
export async function sendPushoverNotification(title, body) {
    const pushoverEnabled = store.get('pushoverEnabled');
    const pushoverUserKey = store.get('pushoverUserKey');
    const pushoverAppToken = store.get('pushoverAppToken');

    if (!pushoverEnabled || !pushoverUserKey || !pushoverAppToken) {
        return;
    }

    const data = new FormData();
    data.append('token', pushoverAppToken);
    data.append('user', pushoverUserKey);
    data.append('title', title);
    data.append('message', body);

    try {
        const response = await fetch(PUSHOVER_API_URL, {
            method: 'POST',
            body: data
        });

        const result = await response.json();

        if (result.status !== 1) {
            console.error('Pushover notification failed:', result.errors);
            // Show user-facing error
            showPushoverError(result.errors?.join(', ') || 'Unknown error');
        }
    } catch (error) {
        console.error('Pushover network error:', error);
        // Show user-facing error
        showPushoverError(error.message);
    }
}

/**
 * Test Pushover configuration by sending a test notification
 */
export async function testPushover() {
    const userKey = document.getElementById('pushoverUserKeyInput')?.value.trim();
    const appToken = document.getElementById('pushoverAppTokenInput')?.value.trim();

    if (!userKey || !appToken) {
        showSettingsStatus('Please enter both User Key and App Token', 'error');
        return;
    }

    showSettingsStatus('Sending test notification...', 'success');

    const data = new FormData();
    data.append('token', appToken);
    data.append('user', userKey);
    data.append('title', '🐦 BirdPage Test');
    data.append('message', 'Pushover notifications are working!');

    try {
        const response = await fetch(PUSHOVER_API_URL, {
            method: 'POST',
            body: data
        });

        const result = await response.json();

        if (result.status === 1) {
            showSettingsStatus('Test notification sent! Check your phone.', 'success');
        } else {
            const errorMsg = result.errors ? result.errors.join(', ') : 'Unknown error';
            showSettingsStatus('Error: ' + errorMsg, 'error');
        }
    } catch (error) {
        showSettingsStatus('Network error: ' + error.message, 'error');
    }
}

/**
 * Show status message in settings modal
 */
export function showSettingsStatus(message, type) {
    const status = DOM.settingsStatus || document.getElementById('settingsStatus');
    if (status) {
        status.textContent = message;
        status.className = 'settings-status ' + type;
        status.style.display = 'block';
    }
}

/**
 * Show a user-facing Pushover error (optional enhancement)
 * Currently logs to console, could show a toast notification
 */
function showPushoverError(message) {
    // For now, just log - could be enhanced to show a toast
    console.warn('Pushover notification failed:', message);
}

/**
 * Toggle Pushover enabled state
 */
export function togglePushoverEnabled() {
    const toggle = document.getElementById('pushoverEnabledToggle');
    store.set('pushoverEnabled', toggle?.checked || false);
}

/**
 * Save Pushover settings to store (persists to localStorage)
 */
export function savePushoverSettings() {
    const enabledToggle = document.getElementById('pushoverEnabledToggle');
    const userKeyInput = document.getElementById('pushoverUserKeyInput');
    const appTokenInput = document.getElementById('pushoverAppTokenInput');

    store.set('pushoverEnabled', enabledToggle?.checked || false);
    store.set('pushoverUserKey', userKeyInput?.value.trim() || '');
    store.set('pushoverAppToken', appTokenInput?.value.trim() || '');

    showSettingsStatus('Settings saved!', 'success');
}
