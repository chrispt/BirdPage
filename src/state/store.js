import { STORAGE_KEYS, REFRESH_INTERVAL_SECONDS } from '../config/constants.js';

/**
 * Centralized state management store
 * Replaces scattered global variables with a single source of truth
 */

const initialState = {
    // API Data
    detections: [],
    speciesDataMap: {},
    stationInfo: null,

    // Timer State
    countdownSeconds: REFRESH_INTERVAL_SECONDS,
    countdownInterval: null,
    pageHiddenTime: null,

    // UI State
    currentViewMode: 'recent', // 'recent' | 'mostDetected'
    currentModalSpecies: null,
    previouslyFocusedElement: null,
    isLoading: false,
    error: null,

    // User Preferences (synced to localStorage)
    notificationsEnabled: false,
    nightModeEnabled: false,
    pushoverEnabled: false,
    pushoverUserKey: '',
    pushoverAppToken: '',
    watchedSpeciesIds: new Set(),

    // Notification Tracking (session only, not persisted)
    previousSpeciesIds: new Set(),
    notifiedWatchedSpecies: new Set()
};

// Keys that should be persisted to localStorage
const PERSISTED_KEYS = [
    'notificationsEnabled',
    'nightModeEnabled',
    'pushoverEnabled',
    'pushoverUserKey',
    'pushoverAppToken',
    'watchedSpeciesIds'
];

class Store {
    constructor() {
        this._state = { ...initialState };
        this._listeners = new Map();
        this._hydrateFromStorage();
    }

    /**
     * Get a specific state value
     */
    get(key) {
        return this._state[key];
    }

    /**
     * Set a specific state value
     */
    set(key, value) {
        const oldValue = this._state[key];

        // Skip if value hasn't changed (for primitives)
        if (oldValue === value) return;

        this._state[key] = value;
        this._notifyListeners(key, value, oldValue);

        // Persist to localStorage if applicable
        if (PERSISTED_KEYS.includes(key)) {
            this._persistToStorage(key, value);
        }
    }

    /**
     * Update multiple state values at once
     */
    update(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    /**
     * Subscribe to changes on a specific key
     * Returns an unsubscribe function
     */
    subscribe(key, callback) {
        if (!this._listeners.has(key)) {
            this._listeners.set(key, new Set());
        }
        this._listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this._listeners.get(key);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }

    /**
     * Subscribe to any state change
     */
    subscribeAll(callback) {
        const key = '*';
        if (!this._listeners.has(key)) {
            this._listeners.set(key, new Set());
        }
        this._listeners.get(key).add(callback);

        return () => {
            const listeners = this._listeners.get(key);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }

    /**
     * Reset a key to its initial value
     */
    reset(key) {
        if (key in initialState) {
            this.set(key, initialState[key]);
        }
    }

    /**
     * Reset all state to initial values
     */
    resetAll() {
        Object.keys(initialState).forEach(key => {
            this._state[key] = initialState[key];
        });
    }

    // Private methods

    _notifyListeners(key, newValue, oldValue) {
        // Notify specific key listeners
        if (this._listeners.has(key)) {
            this._listeners.get(key).forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error(`Error in state listener for "${key}":`, error);
                }
            });
        }

        // Notify global listeners
        if (this._listeners.has('*')) {
            this._listeners.get('*').forEach(callback => {
                try {
                    callback(newValue, oldValue, key);
                } catch (error) {
                    console.error('Error in global state listener:', error);
                }
            });
        }
    }

    _hydrateFromStorage() {
        // Load boolean preferences
        const booleanKeys = ['notificationsEnabled', 'nightModeEnabled', 'pushoverEnabled'];
        booleanKeys.forEach(key => {
            const storageKey = STORAGE_KEYS[this._toStorageKeyName(key)];
            const stored = localStorage.getItem(storageKey || key);
            if (stored !== null) {
                this._state[key] = stored === 'true';
            }
        });

        // Load string preferences
        const stringKeys = ['pushoverUserKey', 'pushoverAppToken'];
        stringKeys.forEach(key => {
            const storageKey = STORAGE_KEYS[this._toStorageKeyName(key)];
            const stored = localStorage.getItem(storageKey || key);
            if (stored !== null) {
                this._state[key] = stored;
            }
        });

        // Load watchedSpeciesIds (Set stored as JSON array)
        // IMPORTANT: Use try-catch to handle corrupted data
        try {
            const watchedIds = localStorage.getItem(STORAGE_KEYS.WATCHED_SPECIES_IDS || 'watchedSpeciesIds');
            if (watchedIds) {
                const parsed = JSON.parse(watchedIds);
                if (Array.isArray(parsed)) {
                    this._state.watchedSpeciesIds = new Set(parsed);
                }
            }
        } catch (error) {
            console.error('Failed to parse watched species IDs from localStorage:', error);
            // Reset to empty set on error
            this._state.watchedSpeciesIds = new Set();
            // Clean up corrupted data
            localStorage.removeItem(STORAGE_KEYS.WATCHED_SPECIES_IDS || 'watchedSpeciesIds');
        }
    }

    _persistToStorage(key, value) {
        const storageKey = STORAGE_KEYS[this._toStorageKeyName(key)] || key;

        try {
            if (value instanceof Set) {
                localStorage.setItem(storageKey, JSON.stringify([...value]));
            } else if (typeof value === 'boolean') {
                localStorage.setItem(storageKey, String(value));
            } else if (typeof value === 'string') {
                localStorage.setItem(storageKey, value);
            } else {
                localStorage.setItem(storageKey, JSON.stringify(value));
            }
        } catch (error) {
            console.error(`Failed to persist "${key}" to localStorage:`, error);
        }
    }

    _toStorageKeyName(camelCaseKey) {
        // Convert camelCase to SCREAMING_SNAKE_CASE for STORAGE_KEYS lookup
        return camelCaseKey
            .replace(/([A-Z])/g, '_$1')
            .toUpperCase();
    }
}

// Create singleton instance
export const store = new Store();

// Export default for convenience
export default store;
