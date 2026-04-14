import { store } from '../state/store.js';
import { DOM } from '../utils/dom.js';
import { formatRelativeTime } from '../utils/formatting.js';
import { getCornellGuideUrl, getCornellSoundsUrl, getCornellMapUrl, IMAGE_FALLBACK, SCORE_TIERS, REFRESH_INTERVAL_SECONDS } from '../config/constants.js';
import { isSpeciesWatched } from './watchlist.js';
import { closeSettingsModal } from './settings.js';
import { refreshIcons } from '../utils/icons.js';
import { fetchHistoricalDetections } from '../api/historical.js';
import {
    buildActivityChartsHTML,
    buildActivityLoadingHTML,
    buildActivityEmptyHTML,
    buildActivityErrorHTML
} from '../rendering/activityChart.js';

const CACHE_TTL_MS = REFRESH_INTERVAL_SECONDS * 1000;

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
        const score = speciesData.highestScore;
        let tierLabel = SCORE_TIERS.POOR.label;
        if (score >= SCORE_TIERS.EXCELLENT.min) tierLabel = SCORE_TIERS.EXCELLENT.label;
        else if (score >= SCORE_TIERS.GOOD.min) tierLabel = SCORE_TIERS.GOOD.label;
        else if (score >= SCORE_TIERS.FAIR.min) tierLabel = SCORE_TIERS.FAIR.label;
        modalHighestConf.textContent = `${score.toFixed(1)} — ${tierLabel}`;
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

    // Reset activity section to collapsed
    resetActivitySection();

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

    // Abort any in-flight activity fetch
    const controller = store.get('activityAbortController');
    if (controller) {
        controller.abort();
        store.set('activityAbortController', null);
    }

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
 * Reset the activity section to its collapsed state
 */
function resetActivitySection() {
    const toggle = DOM.modalActivityToggle || document.getElementById('modalActivityToggle');
    const content = DOM.modalActivityContent || document.getElementById('modalActivityContent');

    if (toggle) toggle.classList.remove('expanded');
    if (content) {
        content.classList.remove('expanded');
        content.innerHTML = '';
    }
}

/**
 * Toggle the activity analysis panel — fetch data if needed, then show/hide
 */
export async function toggleActivityAnalysis() {
    const currentSpecies = store.get('currentModalSpecies');
    if (!currentSpecies) return;

    const toggle = DOM.modalActivityToggle || document.getElementById('modalActivityToggle');
    const content = DOM.modalActivityContent || document.getElementById('modalActivityContent');
    if (!toggle || !content) return;

    const isExpanded = toggle.classList.contains('expanded');

    // Collapse
    if (isExpanded) {
        toggle.classList.remove('expanded');
        content.classList.remove('expanded');
        return;
    }

    // Expand
    toggle.classList.add('expanded');
    content.classList.add('expanded');

    const speciesId = currentSpecies.species.id;

    // Check cache
    const cache = store.get('activityCache');
    const cached = cache[speciesId];
    if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL_MS) {
        renderActivityResult(content, cached.detections, cached.possibleTruncation);
        return;
    }

    // Show loading
    content.innerHTML = buildActivityLoadingHTML(0, 7);

    // Abort any previous fetch
    const prevController = store.get('activityAbortController');
    if (prevController) prevController.abort();

    const controller = new AbortController();
    store.set('activityAbortController', controller);

    try {
        const { detections, possibleTruncation } = await fetchHistoricalDetections(speciesId, {
            days: 7,
            signal: controller.signal,
            onProgress: (completed, total) => {
                // Update loading progress if still visible
                if (content.classList.contains('expanded')) {
                    content.innerHTML = buildActivityLoadingHTML(completed, total);
                }
            }
        });

        // Cache the result
        const updatedCache = { ...store.get('activityCache') };
        updatedCache[speciesId] = { detections, possibleTruncation, fetchedAt: Date.now() };
        store.set('activityCache', updatedCache);

        // Verify we're still showing the same species
        const stillCurrent = store.get('currentModalSpecies');
        if (stillCurrent?.species?.id !== speciesId) return;

        renderActivityResult(content, detections, possibleTruncation);

    } catch (err) {
        if (err.name === 'AbortError') return; // User closed modal, nothing to do
        console.error('Activity analysis failed:', err);
        content.innerHTML = buildActivityErrorHTML(err.message);
    } finally {
        store.set('activityAbortController', null);
    }
}

/**
 * Render activity charts or empty state into the content container
 */
function renderActivityResult(content, detections, possibleTruncation) {
    if (detections.length === 0) {
        content.innerHTML = buildActivityEmptyHTML();
    } else {
        content.innerHTML = buildActivityChartsHTML(detections, possibleTruncation);
    }
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

