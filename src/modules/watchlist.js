import { store } from '../state/store.js';
import { DOM } from '../utils/dom.js';

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
    const watchedSpeciesIds = store.get('watchedSpeciesIds');

    if (watchedSpeciesIds.has(speciesId)) {
        // Remove from watch list
        watchedSpeciesIds.delete(speciesId);
        if (watchBtn) {
            watchBtn.classList.remove('watching');
            watchBtn.innerHTML = '<span>&#x1F514;</span> Add to Watch List';
        }
    } else {
        // Add to watch list
        watchedSpeciesIds.add(speciesId);
        if (watchBtn) {
            watchBtn.classList.add('watching');
            watchBtn.innerHTML = '<span>&#x1F515;</span> Remove from Watch List';
        }
    }

    // Update store (triggers localStorage persistence)
    store.set('watchedSpeciesIds', watchedSpeciesIds);

    // Re-render cards to update visual indicator
    if (renderCallback) {
        renderCallback();
    }
}

/**
 * Toggle watch status from a card button
 */
export function toggleWatchFromCard(speciesId, event) {
    if (event) {
        event.stopPropagation();
    }

    const btn = event?.currentTarget;
    const id = String(speciesId);
    const watchedSpeciesIds = store.get('watchedSpeciesIds');

    if (watchedSpeciesIds.has(id)) {
        watchedSpeciesIds.delete(id);
        if (btn) {
            btn.classList.remove('watching');
            btn.title = 'Add to Watch List';
        }
    } else {
        watchedSpeciesIds.add(id);
        if (btn) {
            btn.classList.add('watching');
            btn.title = 'Remove from Watch List';
        }
    }

    // Update store (triggers localStorage persistence)
    store.set('watchedSpeciesIds', watchedSpeciesIds);
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
