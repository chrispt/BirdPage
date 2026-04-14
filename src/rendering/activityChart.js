import { aggregateByHour, getActivitySummary } from '../analysis/activity.js';

// Show labels every 3 hours to avoid crowding
const HOUR_LABELS = {
    0: '12a', 3: '3a', 6: '6a', 9: '9a',
    12: '12p', 15: '3p', 18: '6p', 21: '9p'
};

/**
 * Build the hour-of-day bar chart HTML
 */
function buildHourChartHTML(hourData) {
    const maxCount = Math.max(...hourData.map(h => h.count), 1);

    const bars = hourData.map(h => {
        const pct = (h.count / maxCount) * 100;
        const label = HOUR_LABELS[h.hour] || '';
        const isPeak = h.count === maxCount && h.count > 0;
        const peakClass = isPeak ? ' activity-bar--peak' : '';
        const tooltip = `${h.count} detection${h.count !== 1 ? 's' : ''}`;

        return `
            <div class="activity-bar-col">
                <div class="activity-bar${peakClass}" style="--bar-height: ${pct}%" title="${h.hour}:00 — ${tooltip}">
                    ${h.count > 0 ? `<span class="activity-bar-count">${h.count}</span>` : ''}
                </div>
                <span class="activity-bar-label">${label}</span>
            </div>
        `;
    }).join('');

    return `<div class="activity-hour-chart">${bars}</div>`;
}

/**
 * Build the full activity charts HTML including summary, hour chart, and footnote
 */
export function buildActivityChartsHTML(detections, possibleTruncation) {
    const hourData = aggregateByHour(detections);
    const { summary, totalDetections } = getActivitySummary(detections);

    const summaryHTML = summary
        ? `<div class="activity-summary">${summary}</div>`
        : '';

    const truncationNote = possibleTruncation
        ? ' <span class="activity-truncation">(some data may be incomplete)</span>'
        : '';

    return `
        ${summaryHTML}
        <h4 class="activity-chart-title">Detections by Time of Day</h4>
        ${buildHourChartHTML(hourData)}
        <p class="activity-footnote">Based on ${totalDetections} detection${totalDetections !== 1 ? 's' : ''} over the last 14 days${truncationNote}</p>
    `;
}

/**
 * Build the loading skeleton HTML for the activity section
 */
export function buildActivityLoadingHTML(completedRequests = 0, totalRequests = 28) {
    const skeletonBars = Array.from({ length: 24 }, (_, i) => {
        const randomHeight = 20 + Math.random() * 60;
        return `<div class="activity-bar-col">
            <div class="activity-bar activity-bar--skeleton" style="--bar-height: ${randomHeight}%"></div>
            <span class="activity-bar-label">${HOUR_LABELS[i] || ''}</span>
        </div>`;
    }).join('');

    return `
        <div class="activity-loading-status">
            Analyzing 14 days of history... ${Math.round((completedRequests / totalRequests) * 100)}%
        </div>
        <div class="activity-hour-chart activity-chart--loading">${skeletonBars}</div>
    `;
}

/**
 * Build the empty state HTML
 */
export function buildActivityEmptyHTML() {
    return `<p class="activity-empty">No detections recorded in the past 7 days for this species.</p>`;
}

/**
 * Build the error state HTML
 */
export function buildActivityErrorHTML(message) {
    return `
        <div class="activity-error">
            <p>Unable to load activity data.</p>
            <button class="activity-retry-btn" data-action="retry-activity">Try Again</button>
        </div>
    `;
}
