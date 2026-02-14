import { store } from '../state/store.js';
import { DOM } from '../utils/dom.js';
import { formatRelativeTime, escapeHtml } from '../utils/formatting.js';
import { isSpeciesWatched } from '../modules/watchlist.js';
import { getEmptyStateHTML } from './skeleton.js';

const IMAGE_FALLBACK = 'https://via.placeholder.com/400x200?text=No+Image';

let isInitialLoad = true;

/**
 * Get confidence level info (label and color)
 */
export function getConfidenceInfo(confidence) {
    const percent = confidence * 100;
    if (percent >= 90) {
        return { label: 'Excellent', color: '#4caf50' };
    } else if (percent >= 75) {
        return { label: 'Good', color: '#4ecca3' };
    }
    return { label: 'Fair', color: '#ffc107' };
}

/**
 * Toggle the detections list expansion for a species card
 */
export function toggleDetectionsList(speciesId) {
    const list = document.getElementById(`detections-list-${speciesId}`);
    const button = document.getElementById(`toggle-btn-${speciesId}`);

    if (list && button) {
        list.classList.toggle('expanded');
        button.classList.toggle('expanded');
    }
}

/**
 * Build HTML for a single detection item
 */
function buildDetectionItemHTML(detection) {
    const timestamp = new Date(detection.timestamp);
    const confidence = detection.confidence || 0;
    const confInfo = getConfidenceInfo(confidence);

    return `
        <a href="https://app.birdweather.com/detections/${detection.id}"
           target="_blank"
           rel="noopener noreferrer"
           class="detection-item"
           data-action="external-link">
            <span class="detection-item-time">${formatRelativeTime(timestamp)}</span>
            <span class="detection-item-confidence">${(confidence * 100).toFixed(1)}%</span>
            <span class="detection-item-certainty" style="background: ${confInfo.color}20; color: ${confInfo.color}">
                ${confInfo.label}
            </span>
        </a>
    `;
}

/**
 * Build HTML for a single species card
 * Uses data attributes instead of inline onclick handlers
 */
function buildSpeciesCardHTML(item) {
    const species = item.species;
    const speciesId = species.id;
    const count = item.detections.length;
    const watched = isSpeciesWatched(speciesId);

    // Sort detections by timestamp string (ISO strings sort lexicographically)
    const sortedDetections = [...item.detections].sort((a, b) =>
        b.timestamp.localeCompare(a.timestamp)
    );

    // Build detections list HTML
    const detectionsListHtml = sortedDetections
        .map(det => buildDetectionItemHTML(det))
        .join('');

    const commonName = escapeHtml(species.common_name || species.commonName || 'Unknown Species');
    const scientificName = escapeHtml(species.scientific_name || species.scientificName || 'Unknown');
    const imageUrl = species.image_url || species.imageUrl || IMAGE_FALLBACK;

    return `
        <div class="species-card"
             tabindex="0"
             role="button"
             aria-label="View details for ${commonName}"
             data-species-id="${speciesId}"
             data-action="open-modal">
            <div class="detection-count-badge" title="${count} detection${count !== 1 ? 's' : ''} in the last 24 hours">${count}</div>
            <button class="card-watch-btn ${watched ? 'watching' : ''}"
                    data-species-id="${speciesId}"
                    data-action="toggle-watch"
                    title="${watched ? 'Remove from Watch List' : 'Add to Watch List'}"
                    aria-label="${watched ? 'Remove from Watch List' : 'Add to Watch List'}">
                &#x1F514;
            </button>
            <div class="species-image-wrapper">
                <img
                    class="species-image"
                    src="${imageUrl}"
                    alt="${commonName}"
                    loading="lazy"
                    decoding="async"
                    onerror="this.onerror=null;this.src='${IMAGE_FALLBACK}'"
                >
            </div>
            <div class="species-content">
                <div class="bird-name">${commonName}</div>
                <div class="scientific-name">${scientificName}</div>

                <div class="species-meta">
                    <span class="meta-tag">Last seen: ${formatRelativeTime(item.latestTimestamp)}</span>
                </div>

                <div class="confidence-bar">
                    <div class="confidence-label">
                        <span>Match Confidence</span>
                        <span>${(item.highestConfidence * 100).toFixed(1)}%</span>
                    </div>
                    <div class="confidence-track">
                        <div class="confidence-fill" style="width: ${item.highestConfidence * 100}%"></div>
                    </div>
                </div>

                <p class="click-hint">Click for more details, bird calls & range maps</p>

                <button
                    id="toggle-btn-${speciesId}"
                    class="detections-toggle"
                    data-species-id="${speciesId}"
                    data-action="toggle-detections">
                    <span>View all ${count} detection${count !== 1 ? 's' : ''}</span>
                    <span class="arrow">&#x25BC;</span>
                </button>

                <div id="detections-list-${speciesId}" class="detections-list">
                    <div class="detections-list-inner">
                        ${detectionsListHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render species cards to the container
 */
export function renderSpeciesCards(detections, sortBy = 'recent') {
    const container = DOM.detections || document.getElementById('detections');
    if (!container) return;

    if (detections.length === 0) {
        container.innerHTML = getEmptyStateHTML();
        return;
    }

    // Group detections by species
    const speciesMap = {};
    detections.forEach(detection => {
        const species = detection.species || {};
        const speciesId = species.id;
        if (speciesId) {
            if (!speciesMap[speciesId]) {
                speciesMap[speciesId] = {
                    species: species,
                    detections: [],
                    highestConfidence: 0,
                    latestTimestamp: null
                };
            }
            speciesMap[speciesId].detections.push(detection);

            const confidence = detection.confidence || 0;
            if (confidence > speciesMap[speciesId].highestConfidence) {
                speciesMap[speciesId].highestConfidence = confidence;
            }

            const timestamp = new Date(detection.timestamp);
            if (!speciesMap[speciesId].latestTimestamp || timestamp > speciesMap[speciesId].latestTimestamp) {
                speciesMap[speciesId].latestTimestamp = timestamp;
            }
        }
    });

    // Store species data globally for modal access
    store.set('speciesDataMap', speciesMap);

    // Convert to array and sort
    let speciesArray = Object.values(speciesMap);

    if (sortBy === 'count') {
        speciesArray.sort((a, b) => b.detections.length - a.detections.length);
    } else {
        // Sort by most recent detection
        speciesArray.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
    }

    // Apply initial-load class for entry animations on first render only
    if (isInitialLoad) {
        container.classList.add('initial-load');
    }

    // Build HTML
    container.innerHTML = speciesArray
        .map(item => buildSpeciesCardHTML(item))
        .join('');

    // Remove initial-load class after animations complete
    if (isInitialLoad) {
        isInitialLoad = false;
        setTimeout(() => {
            container.classList.remove('initial-load');
        }, 1200);
    }
}

/**
 * Render current view based on view mode
 */
export function renderCurrentView() {
    const viewMode = store.get('currentViewMode');
    const detections = store.get('detections');
    const titleEl = DOM.sectionTitleText || document.getElementById('sectionTitleText');

    if (viewMode === 'recent') {
        if (titleEl) titleEl.textContent = 'Species Detected';
        renderSpeciesCards(detections, 'recent');
    } else if (viewMode === 'mostDetected') {
        if (titleEl) titleEl.textContent = 'Most Detected Species';
        renderSpeciesCards(detections, 'count');
    }
}

/**
 * Change the view mode
 */
export function changeViewMode() {
    const viewModeEl = DOM.viewMode || document.getElementById('viewMode');
    if (viewModeEl) {
        store.set('currentViewMode', viewModeEl.value);
    }
    renderCurrentView();
}
