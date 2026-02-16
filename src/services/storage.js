/**
 * Save/Load game state to localStorage.
 * Handles serialization, error recovery, and data validation.
 * @module services/storage
 */

import { useGameStore } from '../state/store';
import { STORAGE_KEY } from '../game/constants';

/**
 * Save the current game state to localStorage.
 * Saves player, world, and missions state (UI state is excluded).
 * @returns {boolean} True if save succeeded, false on error.
 */
export const saveGame = () => {
    const state = useGameStore.getState();
    const saveData = {
        player: state.player,
        world: state.world,
        missions: state.missions,
        savedAt: Date.now(),
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        return true;
    } catch (e) {
        console.error('[Storage] Save failed:', e.message);
        return false;
    }
};

/**
 * Load game state from localStorage and hydrate the store.
 * Merges loaded data with current store defaults for forward compatibility.
 * @returns {boolean} True if load succeeded, false if no data or error.
 */
export const loadGame = () => {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) return false;

        const data = JSON.parse(json);

        // Validate basic structure
        if (!data || typeof data !== 'object' || !data.player) {
            console.warn('[Storage] Invalid save data structure');
            return false;
        }

        // Hydrate store — merge with defaults for forward compatibility
        useGameStore.setState({
            player: { ...useGameStore.getState().player, ...data.player },
            world: { ...useGameStore.getState().world, ...data.world },
            missions: { ...useGameStore.getState().missions, ...data.missions },
        });

        return true;
    } catch (e) {
        console.error('[Storage] Load failed:', e.message);
        return false;
    }
};

/**
 * Remove saved game data from localStorage.
 */
export const clearSave = () => {
    localStorage.removeItem(STORAGE_KEY);
};
