import { store } from '../state/store.js';
import { DOM } from '../utils/dom.js';
import { refreshIcons } from '../utils/icons.js';

// Will be set by main.js to avoid circular dependency
let renderCallback = null;

/**
 * Set the render callback for when watchlist changes
 */
export function setRenderCallback(callback) {
    renderCallback = callback;
}

/**
 * Check if a species is in the watch list
 */
export function isSpeciesWatched(speciesId) {
    const watchedSpeciesIds = store.get('watchedSpeciesIds');
    // Convert to string for consistent comparison
    return watchedSpeciesIds.has(String(speciesId));
}

/**
 * Toggle watch status for the currently open modal species
 */
export function toggleWatchSpecies() {
    const currentModalSpecies = store.get('currentModalSpecies');
    if (!currentModalSpecies) return;

    const speciesId = String(currentModalSpecies.species.id);
    const watchBtn = DOM.modalWatchBtn || document.getElementById('modalWatchBtn');
    const newWatched = new Set(store.get('watchedSpeciesIds'));

    if (newWatched.has(speciesId)) {
        newWatched.delete(speciesId);
        if (watchBtn) {
            watchBtn.classList.remove('watching');
            watchBtn.innerHTML = '<i data-lucide="binoculars"></i> Add to Watch List';
        }
    } else {
        newWatched.add(speciesId);
        if (watchBtn) {
            watchBtn.classList.add('watching');
            watchBtn.innerHTML = '<i data-lucide="binoculars"></i> Remove from Watch List';
        }
    }

    refreshIcons();

    // New Set reference ensures store detects the change and persists
    store.set('watchedSpeciesIds', newWatched);

    // Re-render cards to update visual indicator
    if (renderCallback) {
        renderCallback();
    }
}

/**
 * Toggle watch status from a card button
 * @param {string|number} speciesId
 * @param {Event} [event]
 * @param {HTMLElement} [buttonElement] - The watch button (required when using event delegation)
 */
export function toggleWatchFromCard(speciesId, event, buttonElement) {
    if (event) {
        event.stopPropagation();
    }

    const btn = buttonElement ?? event?.currentTarget;
    const id = String(speciesId);
    const newWatched = new Set(store.get('watchedSpeciesIds'));

    if (newWatched.has(id)) {
        newWatched.delete(id);
        if (btn) {
            btn.classList.remove('watching');
            btn.title = 'Add to Watch List';
        }
    } else {
        newWatched.add(id);
        if (btn) {
            btn.classList.add('watching');
            btn.title = 'Remove from Watch List';
        }
    }

    // New Set reference ensures store detects the change and persists
    store.set('watchedSpeciesIds', newWatched);
}

/**
 * Get the current watch list
 */
export function getWatchedSpecies() {
    return store.get('watchedSpeciesIds');
}

/**
 * Clear the watch list
 */
export function clearWatchList() {
    store.set('watchedSpeciesIds', new Set());
}
