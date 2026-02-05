import { store } from '../state/store.js';
import { DOM } from '../utils/dom.js';

/**
 * Toggle night mode on/off
 */
export function toggleNightMode() {
    const toggle = DOM.nightModeToggle || document.getElementById('nightModeToggle');
    const nightModeEnabled = toggle.checked;

    store.set('nightModeEnabled', nightModeEnabled);

    applyNightMode(nightModeEnabled);
}

/**
 * Apply night mode styles
 */
export function applyNightMode(enabled) {
    const icon = DOM.nightModeIcon || document.getElementById('nightModeIcon');

    if (enabled) {
        document.body.classList.add('night-mode');
        if (icon) icon.textContent = '\uD83C\uDF19'; // Moon icon
    } else {
        document.body.classList.remove('night-mode');
        if (icon) icon.textContent = '\u2600'; // Sun icon
    }
}

/**
 * Initialize theme based on stored preference
 */
export function initTheme() {
    const nightModeEnabled = store.get('nightModeEnabled');

    // Apply theme immediately
    if (nightModeEnabled) {
        document.body.classList.add('night-mode');
    }

    // Set toggle state
    const toggle = DOM.nightModeToggle || document.getElementById('nightModeToggle');
    if (toggle) {
        toggle.checked = nightModeEnabled;
    }

    // Set icon
    applyNightMode(nightModeEnabled);
}
