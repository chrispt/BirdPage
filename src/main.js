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
import { initTheme, toggleNightMode } from './modules/theme.js';
import {
    initNotifications,
    toggleNotifications,
    checkForNewSpecies,
    checkForWatchedSpecies,
    clearNotifiedWatchedSpecies,
    hideNotification
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
    openSettingsModal,
    closeSettingsModal,
    savePushoverSettings,
    testPushover,
    togglePushoverEnabled
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

    // Initialize What's New box
    initWhatsNew();

    // Set up event delegation for cards
    setupEventDelegation();

    // Set up modal keyboard handling
    setupModalKeyboardHandling();

    // Set up visibility change handler
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up retry event listener
    window.addEventListener('birdpage:retry', fetchData);

    // Initial data fetch
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => fetchData(), { timeout: 1000 });
    } else {
        setTimeout(fetchData, 0);
    }
}

// Export functions for global access (needed for inline handlers during transition)
// These will be removed once all inline handlers are converted to event delegation
window.BirdPage = {
    // Modal functions
    openBirdModal,
    closeBirdModal,
    playBirdCall,
    openRangeMap,

    // Watch list
    toggleWatchSpecies,
    toggleWatchFromCard,

    // Settings
    openSettingsModal,
    closeSettingsModal,
    savePushoverSettings,
    testPushover,
    togglePushoverEnabled,

    // Theme
    toggleNightMode,

    // Notifications
    toggleNotifications,
    hideNotification,

    // What's New
    toggleWhatsNew,
    dismissWhatsNew,

    // View
    changeViewMode,

    // Data
    fetchData
};

// Also expose on window for backwards compatibility with HTML onclick handlers
Object.assign(window, window.BirdPage);

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', init);
