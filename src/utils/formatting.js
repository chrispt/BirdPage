/**
 * Date and time formatting utilities
 */

/**
 * Format a date to time only (e.g., "08:49 AM")
 */
export function formatTime(date) {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/**
 * Format a date with date and time (e.g., "Jan 13, 08:49 AM")
 */
export function formatDateTime(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format a date as relative time (e.g., "5 mins ago", "2 hours ago")
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return formatDateTime(date);
}

/**
 * Parse a BirdWeather station timestamp
 * Format from API: "2026-01-13 at 08:49:09 EST"
 */
export function parseStationTimestamp(timestampStr) {
    if (!timestampStr) return null;

    // Remove "at" and timezone abbreviation
    const cleaned = timestampStr
        .replace(' at ', ' ')
        .replace(/ [A-Z]{2,4}$/, '');

    const date = new Date(cleaned);

    if (isNaN(date.getTime())) {
        // Fallback: try parsing date and time parts
        const match = timestampStr.match(/(\d{4}-\d{2}-\d{2}).*?(\d{2}:\d{2}:\d{2})/);
        if (match) {
            return new Date(`${match[1]}T${match[2]}`);
        }
        return null;
    }

    return date;
}

/**
 * Format countdown seconds as MM:SS
 */
export function formatCountdown(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
