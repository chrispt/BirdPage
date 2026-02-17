import { DOM } from '../utils/dom.js';
import { openBirdModal } from '../modules/modal.js';
import { toggleWatchFromCard } from '../modules/watchlist.js';
import { toggleDetectionsList } from '../rendering/cards.js';
import { IMAGE_FALLBACK } from '../config/constants.js';

/**
 * Set up event delegation for the detections container
 * This replaces inline onclick handlers with a single delegated listener
 */
export function setupEventDelegation() {
    const container = DOM.detections || document.getElementById('detections');

    if (!container) {
        console.warn('Detections container not found for event delegation');
        return;
    }

    // Click event delegation
    container.addEventListener('click', handleContainerClick);

    // Keyboard event delegation for accessibility
    container.addEventListener('keydown', handleContainerKeydown);

    // Image error fallback (capture phase — error events don't bubble)
    container.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG' && !e.target.dataset.fallback) {
            e.target.dataset.fallback = 'true';
            e.target.src = IMAGE_FALLBACK;
        }
    }, true);
}

/**
 * Handle click events on the detections container
 */
function handleContainerClick(event) {
    const target = event.target;

    // Check for data-action attributes
    const actionElement = target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        const speciesId = actionElement.dataset.speciesId;

        switch (action) {
            case 'open-modal':
                if (speciesId) {
                    openBirdModal(speciesId);
                }
                return;

            case 'toggle-watch':
                event.stopPropagation();
                if (speciesId) {
                    toggleWatchFromCard(speciesId, event, actionElement);
                }
                return;

            case 'toggle-detections':
                event.stopPropagation();
                if (speciesId) {
                    toggleDetectionsList(speciesId);
                }
                return;

            case 'external-link':
                // Allow default link behavior
                event.stopPropagation();
                return;

            case 'retry':
                event.stopPropagation();
                // Dispatch custom event for retry
                window.dispatchEvent(new CustomEvent('birdpage:retry'));
                return;
        }
    }

    // Fallback: Check for species card click (if not handled by data-action)
    const card = target.closest('.species-card');
    if (card && !target.closest('button') && !target.closest('a')) {
        const speciesId = card.dataset.speciesId;
        if (speciesId) {
            openBirdModal(speciesId);
        }
    }
}

/**
 * Handle keyboard events on the detections container
 */
function handleContainerKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
        return;
    }

    const target = event.target;

    // Handle species card activation
    const card = target.closest('.species-card');
    if (card && event.target === card) {
        event.preventDefault();
        const speciesId = card.dataset.speciesId;
        if (speciesId) {
            openBirdModal(speciesId);
        }
    }
}

