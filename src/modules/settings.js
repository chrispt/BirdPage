import { store } from '../state/store.js';
import { DOM } from '../utils/dom.js';
import { toggleNotifications, hideNotification } from './notifications.js';
import { showSettingsStatus, savePushoverSettings, testPushover, togglePushoverEnabled } from './pushover.js';

/**
 * Open the settings modal
 */
export function openSettingsModal() {
    const modal = DOM.settingsModal || document.getElementById('settingsModal');
    const enabledToggle = document.getElementById('pushoverEnabledToggle');
    const userKeyInput = DOM.pushoverUserKeyInput || document.getElementById('pushoverUserKeyInput');
    const appTokenInput = DOM.pushoverAppTokenInput || document.getElementById('pushoverAppTokenInput');
    const notificationsToggle = document.getElementById('notificationsEnabledToggle');
    const status = DOM.settingsStatus || document.getElementById('settingsStatus');

    // Populate notifications toggle
    if (notificationsToggle) {
        notificationsToggle.checked = store.get('notificationsEnabled');
    }

    // Populate pushover form with current values
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

    // Update conditional sections visibility
    updateConditionalSections();

    // Show modal
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
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

/**
 * Show/hide conditional detail sections based on toggle state
 */
function updateConditionalSections() {
    const notifDetails = document.getElementById('notificationDetails');
    const pushoverDetails = document.getElementById('pushoverDetails');

    if (notifDetails) {
        notifDetails.style.display = store.get('notificationsEnabled') ? 'block' : 'none';
    }
    if (pushoverDetails) {
        pushoverDetails.style.display = store.get('pushoverEnabled') ? 'block' : 'none';
    }
}

/**
 * Save all settings (notifications + pushover)
 */
export function saveAllSettings() {
    // Save notification state from toggle
    const notificationsToggle = document.getElementById('notificationsEnabledToggle');
    if (notificationsToggle) {
        store.set('notificationsEnabled', notificationsToggle.checked);
    }

    // Save pushover settings (handles its own status message)
    savePushoverSettings();
}

/**
 * Initialize all settings modal event listeners
 */
export function initSettingsEvents() {
    // Settings button opens modal
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', openSettingsModal);
    }

    // Modal overlay click-to-close
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.addEventListener('click', closeSettingsModal);
    }

    // Modal close button
    const closeBtn = document.getElementById('settingsCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const modal = DOM.settingsModal || document.getElementById('settingsModal');
            if (modal) modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Notifications toggle
    const notificationsToggle = document.getElementById('notificationsEnabledToggle');
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', () => {
            toggleNotifications();
            updateConditionalSections();
        });
    }

    // Pushover toggle
    const pushoverToggle = document.getElementById('pushoverEnabledToggle');
    if (pushoverToggle) {
        pushoverToggle.addEventListener('change', () => {
            togglePushoverEnabled();
            updateConditionalSections();
        });
    }

    // Test button
    const testBtn = document.getElementById('testPushoverBtn');
    if (testBtn) {
        testBtn.addEventListener('click', testPushover);
    }

    // Save button
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAllSettings);
    }

    // Notification banner close
    const notifCloseBtn = document.getElementById('notificationCloseBtn');
    if (notifCloseBtn) {
        notifCloseBtn.addEventListener('click', hideNotification);
    }
}

// Re-export pushover functions for convenience
export { showSettingsStatus, savePushoverSettings, testPushover, togglePushoverEnabled };
