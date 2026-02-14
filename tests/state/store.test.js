import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to mock localStorage before importing the store
const localStorageMock = {
    store: {},
    getItem: vi.fn((key) => localStorageMock.store[key] ?? null),
    setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
    removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
    clear: vi.fn(() => { localStorageMock.store = {}; })
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Store', () => {
    let Store;

    beforeEach(async () => {
        localStorageMock.store = {};
        vi.resetModules();
        const mod = await import('../../src/state/store.js');
        Store = mod.store;
    });

    it('gets initial state values', () => {
        expect(Store.get('detections')).toEqual([]);
        expect(Store.get('notificationsEnabled')).toBe(false);
        expect(Store.get('currentViewMode')).toBe('recent');
    });

    it('sets and gets values', () => {
        Store.set('currentViewMode', 'mostDetected');
        expect(Store.get('currentViewMode')).toBe('mostDetected');
    });

    it('skips update when value is the same primitive', () => {
        const callback = vi.fn();
        Store.subscribe('currentViewMode', callback);

        Store.set('currentViewMode', 'recent'); // same as initial
        expect(callback).not.toHaveBeenCalled();
    });

    it('notifies subscribers on change', () => {
        const callback = vi.fn();
        Store.subscribe('currentViewMode', callback);

        Store.set('currentViewMode', 'mostDetected');
        expect(callback).toHaveBeenCalledWith('mostDetected', 'recent', 'currentViewMode');
    });

    it('unsubscribes correctly', () => {
        const callback = vi.fn();
        const unsub = Store.subscribe('currentViewMode', callback);

        unsub();
        Store.set('currentViewMode', 'mostDetected');
        expect(callback).not.toHaveBeenCalled();
    });

    it('notifies global listeners', () => {
        const callback = vi.fn();
        Store.subscribeAll(callback);

        Store.set('currentViewMode', 'mostDetected');
        expect(callback).toHaveBeenCalledWith('mostDetected', 'recent', 'currentViewMode');
    });

    it('persists notificationsEnabled to localStorage', () => {
        Store.set('notificationsEnabled', true);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('notificationsEnabled', 'true');
    });

    it('persists watchedSpeciesIds as JSON array', () => {
        Store.set('watchedSpeciesIds', new Set(['123', '456']));
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'watchedSpeciesIds',
            JSON.stringify(['123', '456'])
        );
    });

    it('updates multiple values at once', () => {
        Store.update({
            currentViewMode: 'mostDetected',
            isLoading: true
        });
        expect(Store.get('currentViewMode')).toBe('mostDetected');
        expect(Store.get('isLoading')).toBe(true);
    });

    it('resets a key to initial value', () => {
        Store.set('currentViewMode', 'mostDetected');
        Store.reset('currentViewMode');
        expect(Store.get('currentViewMode')).toBe('recent');
    });

    it('handles listener errors gracefully', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        Store.subscribe('currentViewMode', () => { throw new Error('test error'); });

        // Should not throw
        Store.set('currentViewMode', 'mostDetected');
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    it('hydrates boolean from localStorage', async () => {
        localStorageMock.store = { notificationsEnabled: 'true' };
        vi.resetModules();
        const mod = await import('../../src/state/store.js');
        expect(mod.store.get('notificationsEnabled')).toBe(true);
    });

    it('hydrates watchedSpeciesIds from localStorage', async () => {
        localStorageMock.store = { watchedSpeciesIds: JSON.stringify(['1', '2']) };
        vi.resetModules();
        const mod = await import('../../src/state/store.js');
        expect(mod.store.get('watchedSpeciesIds')).toEqual(new Set(['1', '2']));
    });

    it('handles corrupted watchedSpeciesIds gracefully', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        localStorageMock.store = { watchedSpeciesIds: 'not-valid-json{' };
        vi.resetModules();
        const mod = await import('../../src/state/store.js');
        expect(mod.store.get('watchedSpeciesIds')).toEqual(new Set());
        errorSpy.mockRestore();
    });
});
