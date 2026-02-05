/**
 * DOM utilities and element cache
 */

// DOM element cache - populated on DOMContentLoaded
export const DOM = {
    // Status bar elements
    countdown: null,
    lastUpdate: null,
    pucStatusDot: null,
    pucStatusLabel: null,
    locationDisplay: null,
    refreshBtn: null,

    // Stats grid
    totalDetections: null,
    uniqueSpecies: null,
    latestTime: null,
    topConfidence: null,

    // Main content
    detections: null,
    viewMode: null,
    sectionTitleText: null,

    // Corner toggles
    nightModeToggle: null,
    nightModeIcon: null,
    notificationToggle: null,

    // Modals
    birdModal: null,
    settingsModal: null,

    // Modal elements
    modalImage: null,
    modalBirdName: null,
    modalScientificName: null,
    modalDetectionCount: null,
    modalHighestConf: null,
    modalLastSeen: null,
    modalPlayCall: null,
    modalRangeMapBtn: null,
    modalWatchBtn: null,
    modalCornellLink: null,

    // Settings modal elements
    pushoverEnabledToggle: null,
    pushoverUserKeyInput: null,
    pushoverAppTokenInput: null,
    settingsStatus: null,

    // Notifications
    notificationBanner: null,
    notificationTitle: null,
    notificationBody: null,

    // What's New
    whatsNewBox: null
};

/**
 * Initialize DOM cache by querying all elements
 * Call this after DOMContentLoaded
 */
export function initDOMCache() {
    // Status bar
    DOM.countdown = document.getElementById('countdown');
    DOM.lastUpdate = document.getElementById('lastUpdate');
    DOM.pucStatusDot = document.getElementById('pucStatusDot');
    DOM.pucStatusLabel = document.getElementById('pucStatusLabel');
    DOM.locationDisplay = document.getElementById('locationDisplay');
    DOM.refreshBtn = document.getElementById('refreshBtn');

    // Stats grid
    DOM.totalDetections = document.getElementById('totalDetections');
    DOM.uniqueSpecies = document.getElementById('uniqueSpecies');
    DOM.latestTime = document.getElementById('latestTime');
    DOM.topConfidence = document.getElementById('topConfidence');

    // Main content
    DOM.detections = document.getElementById('detections');
    DOM.viewMode = document.getElementById('viewMode');
    DOM.sectionTitleText = document.getElementById('sectionTitleText');

    // Corner toggles
    DOM.nightModeToggle = document.getElementById('nightModeToggle');
    DOM.nightModeIcon = document.getElementById('nightModeIcon');
    DOM.notificationToggle = document.getElementById('notificationToggle');

    // Modals
    DOM.birdModal = document.getElementById('birdModal');
    DOM.settingsModal = document.getElementById('settingsModal');

    // Modal elements
    DOM.modalImage = document.getElementById('modalImage');
    DOM.modalBirdName = document.getElementById('modalBirdName');
    DOM.modalScientificName = document.getElementById('modalScientificName');
    DOM.modalDetectionCount = document.getElementById('modalDetectionCount');
    DOM.modalHighestConf = document.getElementById('modalHighestConf');
    DOM.modalLastSeen = document.getElementById('modalLastSeen');
    DOM.modalPlayCall = document.getElementById('modalPlayCall');
    DOM.modalRangeMapBtn = document.getElementById('modalRangeMapBtn');
    DOM.modalWatchBtn = document.getElementById('modalWatchBtn');
    DOM.modalCornellLink = document.getElementById('modalCornellLink');

    // Settings modal elements
    DOM.pushoverEnabledToggle = document.getElementById('pushoverEnabledToggle');
    DOM.pushoverUserKeyInput = document.getElementById('pushoverUserKeyInput');
    DOM.pushoverAppTokenInput = document.getElementById('pushoverAppTokenInput');
    DOM.settingsStatus = document.getElementById('settingsStatus');

    // Notifications
    DOM.notificationBanner = document.getElementById('notificationBanner');
    DOM.notificationTitle = document.getElementById('notificationTitle');
    DOM.notificationBody = document.getElementById('notificationBody');

    // What's New
    DOM.whatsNewBox = document.getElementById('whatsNewBox');
}

/**
 * Get an element from cache or query directly
 * Useful for elements that might be dynamically added
 */
export function getElement(id) {
    const cacheKey = id.replace(/^#/, '');
    return DOM[cacheKey] || document.getElementById(cacheKey);
}

/**
 * Safely set text content of an element
 */
export function setText(elementOrId, text) {
    const el = typeof elementOrId === 'string'
        ? getElement(elementOrId)
        : elementOrId;

    if (el) {
        el.textContent = text;
    }
}

/**
 * Safely set inner HTML of an element
 */
export function setHTML(elementOrId, html) {
    const el = typeof elementOrId === 'string'
        ? getElement(elementOrId)
        : elementOrId;

    if (el) {
        el.innerHTML = html;
    }
}

/**
 * Toggle a class on an element
 */
export function toggleClass(elementOrId, className, force) {
    const el = typeof elementOrId === 'string'
        ? getElement(elementOrId)
        : elementOrId;

    if (el) {
        el.classList.toggle(className, force);
    }
}
