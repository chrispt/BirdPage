/**
 * Skeleton loading HTML templates
 */

/**
 * Get skeleton card HTML
 */
export function getSkeletonCardHTML() {
    return `
        <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-subtitle"></div>
                <div class="skeleton-tag"></div>
                <div class="skeleton-bar"></div>
                <div class="skeleton-button"></div>
            </div>
        </div>
    `;
}

/**
 * Get skeleton grid HTML (3 cards)
 */
export function getSkeletonGridHTML() {
    return `
        <div class="skeleton-grid">
            ${getSkeletonCardHTML()}
            ${getSkeletonCardHTML()}
            ${getSkeletonCardHTML()}
        </div>
    `;
}

/**
 * Get empty state HTML
 */
export function getEmptyStateHTML() {
    return `
        <div class="loading">
            <p style="font-size: 2rem; margin-bottom: 10px;">🐦</p>
            <p>No bird detections in the last 24 hours.</p>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 10px;">Check back later or try refreshing.</p>
        </div>
    `;
}

/**
 * Get error state HTML
 */
export function getErrorStateHTML(errorMessage) {
    // Sanitize error message
    const safeMessage = String(errorMessage)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    return `
        <div class="error">
            <p><strong>Error loading data</strong></p>
            <p>${safeMessage}</p>
            <p style="margin-top: 15px;">
                <button class="refresh-btn" data-action="retry">Try Again</button>
            </p>
        </div>
    `;
}
