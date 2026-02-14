/**
 * BirdPage - Main Entry Point
 * Real-time bird detection dashboard for BirdWeather stations
 */

// Import styles
import '../styles/main.css';

// Import state
import { store } from './state/store.js';

// Import utilities
import { initDOMCache, DOM } from './utils/dom.js';
import { formatTime } from './utils/formatting.js';

// Import API
import { fetchDetections } from './api/detections.js';

// Import modules
import { startCountdown, handleVisibilityChange, setFetchDataCallback } from './modules/timer.js';
import { initTheme } from './modules/theme.js';
import {
    initNotifications,
    checkForNewSpecies,
    checkForWatchedSpecies,
    clearNotifiedWatchedSpecies
} from './modules/notifications.js';
import { initWhatsNew, toggleWhatsNew, dismissWhatsNew } from './modules/whatsNew.js';
import {
    openBirdModal,
    closeBirdModal,
    playBirdCall,
    openRangeMap,
    setupModalKeyboardHandling
} from './modules/modal.js';
import {
    toggleWatchSpecies,
    toggleWatchFromCard,
    setRenderCallback
} from './modules/watchlist.js';
import {
    initSettingsEvents
} from './modules/settings.js';

// Import rendering
import { renderCurrentView, changeViewMode } from './rendering/cards.js';
import { updateStats, updateLastUpdateTime, updatePucStatus, updateLocationDisplay } from './rendering/stats.js';
import { getSkeletonGridHTML, getErrorStateHTML } from './rendering/skeleton.js';

// Import events
import { setupEventDelegation } from './events/delegation.js';

/**
 * Main data fetch function
 */
async function fetchData() {
    const detectionsContainer = DOM.detections || document.getElementById('detections');
    const refreshBtn = DOM.refreshBtn || document.getElementById('refreshBtn');

    // Show loading state
    if (refreshBtn) {
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
        refreshBtn.textContent = 'Refreshing';
    }

    if (detectionsContainer) {
        detectionsContainer.innerHTML = getSkeletonGridHTML();
    }

    try {
        // Fetch data
        const { detections, rawDetections, stationInfo, error } = await fetchDetections(24);

        if (error) {
            throw error;
        }

        // Update store
        store.set('detections', detections);

        // Update PUC status from station info
        if (stationInfo) {
            updatePucStatus(stationInfo.latestDetectionAt);
        }

        // Update location from first detection
        if (rawDetections && rawDetections.length > 0) {
            const firstDetection = rawDetections[0];
            updateLocationDisplay(firstDetection.lat, firstDetection.lon);
        }

        // Update stats
        updateStats(detections);

        // Check for new species (notifications)
        checkForNewSpecies(detections);

        // Check for watched species (notifications)
        clearNotifiedWatchedSpecies();
        checkForWatchedSpecies(detections);

        // Render cards
        renderCurrentView();

        // Re-render Lucide icons for dynamic content
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Update last update time
        updateLastUpdateTime();

        // Restart countdown
        startCountdown();

        // Reset refresh button
        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
            refreshBtn.textContent = 'Refresh Now';
        }

    } catch (error) {
        console.error('Error fetching data:', error);

        if (detectionsContainer) {
            detectionsContainer.innerHTML = getErrorStateHTML(error.message);
        }

        // Reset refresh button on error
        if (refreshBtn) {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
            refreshBtn.textContent = 'Refresh Now';
        }
    }
}

/**
 * Set up event listeners for elements that previously used inline handlers
 */
function setupInlineEventListeners() {
    // Bird modal overlay click-to-close
    const birdModal = document.getElementById('birdModal');
    if (birdModal) {
        birdModal.addEventListener('click', (e) => closeBirdModal(e));
    }

    // Bird modal close button
    const birdModalCloseBtn = document.getElementById('birdModalCloseBtn');
    if (birdModalCloseBtn) {
        birdModalCloseBtn.addEventListener('click', () => closeBirdModal());
    }

    // Modal action buttons
    const modalPlayCall = document.getElementById('modalPlayCall');
    if (modalPlayCall) {
        modalPlayCall.addEventListener('click', playBirdCall);
    }

    const modalRangeMapBtn = document.getElementById('modalRangeMapBtn');
    if (modalRangeMapBtn) {
        modalRangeMapBtn.addEventListener('click', openRangeMap);
    }

    const modalWatchBtn = document.getElementById('modalWatchBtn');
    if (modalWatchBtn) {
        modalWatchBtn.addEventListener('click', toggleWatchSpecies);
    }

    // What's New header toggle
    const whatsNewHeader = document.getElementById('whatsNewHeader');
    if (whatsNewHeader) {
        whatsNewHeader.addEventListener('click', toggleWhatsNew);
    }

    // What's New close button
    const whatsNewCloseBtn = document.getElementById('whatsNewCloseBtn');
    if (whatsNewCloseBtn) {
        whatsNewCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dismissWhatsNew();
        });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchData);
    }

    // View mode selector
    const viewMode = document.getElementById('viewMode');
    if (viewMode) {
        viewMode.addEventListener('change', changeViewMode);
    }
}

/**
 * Initialize the application
 */
function init() {
    // Initialize DOM cache
    initDOMCache();

    // Set up callbacks for modules that need them
    setFetchDataCallback(fetchData);
    setRenderCallback(renderCurrentView);

    // Initialize theme
    initTheme();

    // Initialize notifications toggle
    initNotifications();

    // Initialize settings modal event listeners
    initSettingsEvents();

    // Initialize What's New box
    initWhatsNew();

    // Set up event delegation for cards
    setupEventDelegation();

    // Set up event listeners for elements (replaces inline handlers)
    setupInlineEventListeners();

    // Set up modal keyboard handling
    setupModalKeyboardHandling();

    // Set up visibility change handler
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up retry event listener
    window.addEventListener('birdpage:retry', fetchData);

    // Initialize Lucide icons for static HTML
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Initial data fetch
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => fetchData(), { timeout: 1000 });
    } else {
        setTimeout(fetchData, 0);
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);
