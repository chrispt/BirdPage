import { describe, it, expect } from 'vitest';
import {
    getCornellGuideUrl,
    getCornellSoundsUrl,
    getCornellMapUrl,
    CORNELL_BASE_URL
} from '../../src/config/constants.js';

describe('getCornellGuideUrl', () => {
    it('converts spaces to underscores', () => {
        expect(getCornellGuideUrl('Northern Cardinal')).toBe(`${CORNELL_BASE_URL}/Northern_Cardinal`);
    });

    it('handles single-word names', () => {
        expect(getCornellGuideUrl('Robin')).toBe(`${CORNELL_BASE_URL}/Robin`);
    });

    it('handles multiple spaces', () => {
        expect(getCornellGuideUrl('Great Blue Heron')).toBe(`${CORNELL_BASE_URL}/Great_Blue_Heron`);
    });
});

describe('getCornellSoundsUrl', () => {
    it('appends /sounds to the guide URL', () => {
        expect(getCornellSoundsUrl('Northern Cardinal')).toBe(`${CORNELL_BASE_URL}/Northern_Cardinal/sounds`);
    });
});

describe('getCornellMapUrl', () => {
    it('appends /maps-range to the guide URL', () => {
        expect(getCornellMapUrl('Northern Cardinal')).toBe(`${CORNELL_BASE_URL}/Northern_Cardinal/maps-range`);
    });
});
