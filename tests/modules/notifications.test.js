// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock store
vi.mock('../../src/state/store.js', () => ({
    store: {
        get: vi.fn(),
        set: vi.fn()
    }
}));

// Mock DOM
vi.mock('../../src/utils/dom.js', () => ({
    DOM: {}
}));

// Mock pushover
vi.mock('../../src/modules/pushover.js', () => ({
    sendPushoverNotification: vi.fn()
}));

// Mock constants
vi.mock('../../src/config/constants.js', () => ({
    NOTIFICATION_AUTO_HIDE_MS: 5000
}));

import { store } from '../../src/state/store.js';
import { sendPushoverNotification } from '../../src/modules/pushover.js';
import { checkForNewSpecies, checkForWatchedSpecies, clearNotifiedWatchedSpecies } from '../../src/modules/notifications.js';

describe('checkForNewSpecies', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not notify on first run (empty previousSpeciesIds)', () => {
        store.get.mockImplementation((key) => {
            if (key === 'previousSpeciesIds') return new Set();
            if (key === 'notificationsEnabled') return true;
            return null;
        });

        const detections = [
            { species: { id: 1, common_name: 'Robin' } }
        ];

        checkForNewSpecies(detections);
        expect(sendPushoverNotification).not.toHaveBeenCalled();
    });

    it('notifies when new species appear', () => {
        store.get.mockImplementation((key) => {
            if (key === 'previousSpeciesIds') return new Set([1]); // had species 1 before
            if (key === 'notificationsEnabled') return true;
            return null;
        });

        const detections = [
            { species: { id: 1, common_name: 'Robin' } },
            { species: { id: 2, common_name: 'Cardinal' } } // new species
        ];

        checkForNewSpecies(detections);
        expect(sendPushoverNotification).toHaveBeenCalledWith(
            'New Species Detected!',
            'A Cardinal was just spotted at the feeder!'
        );
    });
});

describe('checkForWatchedSpecies', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does nothing when watch list is empty', () => {
        store.get.mockImplementation((key) => {
            if (key === 'watchedSpeciesIds') return new Set();
            return null;
        });

        checkForWatchedSpecies([]);
        expect(sendPushoverNotification).not.toHaveBeenCalled();
    });

    it('notifies when watched species is detected', () => {
        store.get.mockImplementation((key) => {
            if (key === 'watchedSpeciesIds') return new Set(['1']);
            if (key === 'notifiedWatchedSpecies') return new Set();
            if (key === 'notificationsEnabled') return true;
            return null;
        });

        const detections = [
            { species: { id: 1, common_name: 'Robin' } }
        ];

        checkForWatchedSpecies(detections);
        expect(sendPushoverNotification).toHaveBeenCalledWith(
            'Watched Bird Spotted!',
            'Robin is at the feeder!'
        );
    });

    it('does not re-notify already notified species', () => {
        store.get.mockImplementation((key) => {
            if (key === 'watchedSpeciesIds') return new Set(['1']);
            if (key === 'notifiedWatchedSpecies') return new Set(['1']); // already notified
            if (key === 'notificationsEnabled') return true;
            return null;
        });

        const detections = [
            { species: { id: 1, common_name: 'Robin' } }
        ];

        checkForWatchedSpecies(detections);
        expect(sendPushoverNotification).not.toHaveBeenCalled();
    });
});

describe('clearNotifiedWatchedSpecies', () => {
    it('resets notified set', () => {
        clearNotifiedWatchedSpecies();
        expect(store.set).toHaveBeenCalledWith('notifiedWatchedSpecies', new Set());
    });
});
