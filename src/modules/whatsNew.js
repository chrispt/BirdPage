import { DOM } from '../utils/dom.js';
import { STORAGE_KEYS } from '../config/constants.js';

/**
 * Toggle the What's New box expanded/collapsed state
 */
export function toggleWhatsNew() {
    const box = DOM.whatsNewBox || document.getElementById('whatsNewBox');
    if (box) {
        box.classList.toggle('expanded');
    }
}

/**
 * Dismiss the What's New box permanently
 */
export function dismissWhatsNew() {
    const box = DOM.whatsNewBox || document.getElementById('whatsNewBox');
    if (box) {
        box.classList.add('hidden');
    }
    localStorage.setItem(STORAGE_KEYS.WHATS_NEW_DISMISSED || 'whatsNewDismissed', 'true');
}

/**
 * Initialize What's New box state based on stored preference
 */
export function initWhatsNew() {
    const isDismissed = localStorage.getItem(
        STORAGE_KEYS.WHATS_NEW_DISMISSED || 'whatsNewDismissed'
    ) === 'true';

    if (isDismissed) {
        const box = DOM.whatsNewBox || document.getElementById('whatsNewBox');
        if (box) {
            box.classList.add('hidden');
        }
    }
}

/**
 * Reset What's New dismissal (show it again)
 */
export function resetWhatsNew() {
    localStorage.removeItem(STORAGE_KEYS.WHATS_NEW_DISMISSED || 'whatsNewDismissed');
    const box = DOM.whatsNewBox || document.getElementById('whatsNewBox');
    if (box) {
        box.classList.remove('hidden');
    }
}
