import { store } from '../state/store.js';

/**
 * Toggle night mode on/off
 */
export function toggleNightMode() {
    const enabled = !store.get('nightModeEnabled');
    store.set('nightModeEnabled', enabled);
    applyNightMode(enabled);
}

/**
 * Apply night mode styles
 */
export function applyNightMode(enabled) {
    const icon = document.getElementById('nightModeIcon');
    const btn = document.getElementById('nightModeBtn');

    if (enabled) {
        document.body.classList.add('night-mode');
        if (icon) {
            icon.setAttribute('data-lucide', 'moon');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    } else {
        document.body.classList.remove('night-mode');
        if (icon) {
            icon.setAttribute('data-lucide', 'sun');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    if (btn) {
        btn.setAttribute('aria-pressed', String(enabled));
    }
}

/**
 * Initialize theme based on stored preference
 */
export function initTheme() {
    const nightModeEnabled = store.get('nightModeEnabled');

    // Apply theme immediately
    applyNightMode(nightModeEnabled);

    // Attach click listener to button
    const btn = document.getElementById('nightModeBtn');
    if (btn) {
        btn.addEventListener('click', toggleNightMode);
    }
}
