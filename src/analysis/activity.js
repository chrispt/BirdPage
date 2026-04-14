/**
 * Aggregate detections by hour of day (0-23)
 * Uses local timezone so charts reflect the user's actual experience
 * @param {Array} detections - Array of detection objects with `timestamp`
 * @returns {Array<{hour: number, count: number}>} 24 entries, one per hour
 */
export function aggregateByHour(detections) {
    const counts = new Array(24).fill(0);

    for (const d of detections) {
        const hour = new Date(d.timestamp).getHours();
        counts[hour]++;
    }

    return counts.map((count, hour) => ({ hour, count }));
}

/**
 * Format an hour number (0-23) as a human-readable time string
 */
function formatHour(hour) {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

/**
 * Build a summary of activity patterns
 * @param {Array} detections - Raw detection array
 * @returns {{peakHourLabel: string, totalDetections: number, summary: string}}
 */
export function getActivitySummary(detections) {
    if (detections.length === 0) {
        return { peakHourLabel: null, totalDetections: 0, summary: '' };
    }

    const hourly = aggregateByHour(detections);

    // Find peak hour (earliest wins on tie)
    let peakHour = hourly[0];
    for (const h of hourly) {
        if (h.count > peakHour.count) peakHour = h;
    }

    const peakHourLabel = formatHour(peakHour.hour);
    const summary = `Most active around ${peakHourLabel}`;

    return { peakHourLabel, totalDetections: detections.length, summary };
}
