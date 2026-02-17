import { store } from '../state/store.js';
import { DOM } from '../utils/dom.js';
import { formatRelativeTime } from '../utils/formatting.js';
import { getCornellGuideUrl, getCornellSoundsUrl, getCornellMapUrl, IMAGE_FALLBACK } from '../config/constants.js';
import { isSpeciesWatched } from './watchlist.js';
import { closeSettingsModal } from './settings.js';
import { refreshIcons } from '../utils/icons.js';

/**
 * Open the bird details modal for a species
 */
export function openBirdModal(speciesId) {
    const speciesDataMap = store.get('speciesDataMap');
    const speciesData = speciesDataMap[speciesId];

    if (!speciesData) return;

    // Store currently focused element to restore later
    store.set('previouslyFocusedElement', document.activeElement);
    store.set('currentModalSpecies', speciesData);

    const species = speciesData.species;
    const modal = DOM.birdModal || document.getElementById('birdModal');

    // Set image
    const modalImage = DOM.modalImage || document.getElementById('modalImage');
    if (modalImage) {
        modalImage.src = species.image_url || species.imageUrl || IMAGE_FALLBACK;
        modalImage.alt = species.common_name || species.commonName || 'Bird';
    }

    // Set names
    const modalBirdName = DOM.modalBirdName || document.getElementById('modalBirdName');
    const modalScientificName = DOM.modalScientificName || document.getElementById('modalScientificName');
    if (modalBirdName) {
        modalBirdName.textContent = species.common_name || species.commonName || 'Unknown Species';
    }
    if (modalScientificName) {
        modalScientificName.textContent = species.scientific_name || species.scientificName || 'Unknown';
    }

    // Set stats
    const modalDetectionCount = DOM.modalDetectionCount || document.getElementById('modalDetectionCount');
    const modalHighestConf = DOM.modalHighestConf || document.getElementById('modalHighestConf');
    const modalLastSeen = DOM.modalLastSeen || document.getElementById('modalLastSeen');

    if (modalDetectionCount) {
        modalDetectionCount.textContent = speciesData.detections.length;
    }
    if (modalHighestConf) {
        modalHighestConf.textContent = `${(speciesData.highestConfidence * 100).toFixed(0)}%`;
    }
    if (modalLastSeen) {
        modalLastSeen.textContent = formatRelativeTime(speciesData.latestTimestamp);
    }

    // Set Cornell All About Birds link
    const commonName = species.common_name || species.commonName || '';
    const cornellLink = DOM.modalCornellLink || document.getElementById('modalCornellLink');
    if (cornellLink && commonName) {
        cornellLink.href = getCornellGuideUrl(commonName);
    }

    // Setup bird call button
    const playBtn = DOM.modalPlayCall || document.getElementById('modalPlayCall');
    if (playBtn) {
        playBtn.disabled = false;
        playBtn.innerHTML = '<i data-lucide="volume-2"></i> Listen on Cornell';
        playBtn.classList.remove('playing');
    }

    // Update watch button state
    const watchBtn = DOM.modalWatchBtn || document.getElementById('modalWatchBtn');
    if (watchBtn) {
        if (isSpeciesWatched(speciesId)) {
            watchBtn.classList.add('watching');
            watchBtn.innerHTML = '<i data-lucide="binoculars"></i> Remove from Watch List';
        } else {
            watchBtn.classList.remove('watching');
            watchBtn.innerHTML = '<i data-lucide="binoculars"></i> Add to Watch List';
        }
    }

    refreshIcons();

    // Show modal
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus the close button for accessibility
        setTimeout(() => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }
}

/**
 * Close the bird details modal
 */
export function closeBirdModal(event) {
    if (event && event.target !== event.currentTarget) return;

    const modal = DOM.birdModal || document.getElementById('birdModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = '';

    // Return focus to the element that opened the modal
    const previouslyFocusedElement = store.get('previouslyFocusedElement');
    if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
        store.set('previouslyFocusedElement', null);
    }

    store.set('currentModalSpecies', null);
}

/**
 * Open Cornell All About Birds sounds page
 */
export function playBirdCall() {
    const currentModalSpecies = store.get('currentModalSpecies');
    if (!currentModalSpecies) return;

    const species = currentModalSpecies.species;
    const commonName = species.common_name || species.commonName || '';

    if (!commonName) return;

    window.open(getCornellSoundsUrl(commonName), '_blank');
}

/**
 * Open Cornell All About Birds range map
 */
export function openRangeMap() {
    const currentModalSpecies = store.get('currentModalSpecies');
    if (!currentModalSpecies) return;

    const species = currentModalSpecies.species;
    const commonName = species.common_name || species.commonName || '';

    if (!commonName) return;

    window.open(getCornellMapUrl(commonName), '_blank');
}

/**
 * Setup modal keyboard navigation and focus trap
 */
export function setupModalKeyboardHandling() {
    document.addEventListener('keydown', (e) => {
        const modal = DOM.birdModal || document.getElementById('birdModal');
        const settingsModal = DOM.settingsModal || document.getElementById('settingsModal');

        const isBirdModalOpen = modal?.classList.contains('active');
        const isSettingsModalOpen = settingsModal?.classList.contains('active');

        // Handle Escape key
        if (e.key === 'Escape') {
            if (isBirdModalOpen) {
                closeBirdModal();
                return;
            }
            if (isSettingsModalOpen) {
                closeSettingsModal();
                return;
            }
        }

        // Focus trap for bird modal
        if (isBirdModalOpen && e.key === 'Tab') {
            trapFocusInModal(modal, e);
        }

        // Focus trap for settings modal
        if (isSettingsModalOpen && e.key === 'Tab') {
            trapFocusInModal(settingsModal, e);
        }
    });
}

/**
 * Trap focus within a modal
 */
function trapFocusInModal(modal, e) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
    }
}

