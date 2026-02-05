import { store } from '../state/store.js';
import { DOM } from '../utils/dom.js';
import { showSettingsStatus, savePushoverSettings, testPushover, togglePushoverEnabled } from './pushover.js';

/**
 * Open the settings modal
 */
export function openSettingsModal() {
    const modal = DOM.settingsModal || document.getElementById('settingsModal');
    const enabledToggle = DOM.pushoverEnabledToggle || document.getElementById('pushoverEnabledToggle');
    const userKeyInput = DOM.pushoverUserKeyInput || document.getElementById('pushoverUserKeyInput');
    const appTokenInput = DOM.pushoverAppTokenInput || document.getElementById('pushoverAppTokenInput');
    const status = DOM.settingsStatus || document.getElementById('settingsStatus');

    // Populate form with current values
    if (enabledToggle) {
        enabledToggle.checked = store.get('pushoverEnabled');
    }
    if (userKeyInput) {
        userKeyInput.value = store.get('pushoverUserKey');
    }
    if (appTokenInput) {
        appTokenInput.value = store.get('pushoverAppToken');
    }
    if (status) {
        status.style.display = 'none';
    }

    // Show modal
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus the first input for accessibility
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"], input[type="checkbox"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

/**
 * Close the settings modal
 */
export function closeSettingsModal(event) {
    if (event && event.target !== event.currentTarget) return;

    const modal = DOM.settingsModal || document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = '';
}

// Re-export pushover functions for convenience
export { showSettingsStatus, savePushoverSettings, testPushover, togglePushoverEnabled };
