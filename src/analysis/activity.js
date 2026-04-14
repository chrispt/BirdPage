const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
 * Aggregate detections by day of week (0=Sun, 6=Sat)
 * @param {Array} detections - Array of detection objects with `timestamp`
 * @returns {Array<{day: number, label: string, count: number}>} 7 entries
 */
export function aggregateByDayOfWeek(detections) {
    const counts = new Array(7).fill(0);

    for (const d of detections) {
        const day = new Date(d.timestamp).getDay();
        counts[day]++;
    }

    return counts.map((count, day) => ({ day, label: DAY_LABELS[day], count }));
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
 * @returns {{peakHourLabel: string, peakDayLabel: string, totalDetections: number, summary: string}}
 */
export function getActivitySummary(detections) {
    if (detections.length === 0) {
        return { peakHourLabel: null, peakDayLabel: null, totalDetections: 0, summary: '' };
    }

    const hourly = aggregateByHour(detections);
    const daily = aggregateByDayOfWeek(detections);

    // Find peak hour (earliest wins on tie)
    let peakHour = hourly[0];
    for (const h of hourly) {
        if (h.count > peakHour.count) peakHour = h;
    }

    // Find peak day (earliest wins on tie)
    let peakDay = daily[0];
    for (const d of daily) {
        if (d.count > peakDay.count) peakDay = d;
    }

    const peakHourLabel = formatHour(peakHour.hour);
    const peakDayLabel = peakDay.label;

    // Build a natural-language summary
    let summary = `Most active around ${peakHourLabel}`;
    // Only mention day if it's meaningfully higher than average
    const avgDayCount = detections.length / 7;
    if (peakDay.count > avgDayCount * 1.3) {
        summary += `, especially on ${peakDayLabel}s`;
    }

    return { peakHourLabel, peakDayLabel, totalDetections: detections.length, summary };
}
