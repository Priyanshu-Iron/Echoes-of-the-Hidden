import { useGameStore } from '../state/store';

const STORAGE_KEY = 'echoes_save_v1';

export const saveGame = () => {
    const state = useGameStore.getState();
    const saveData = {
        player: state.player,
        world: state.world,
        missions: state.missions
        // UI state usually not saved
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        console.log('Game Saved');
        return true;
    } catch (e) {
        console.error('Save Failed', e);
        return false;
    }
};

export const loadGame = () => {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) return false;
        
        const data = JSON.parse(json);
        
        // Hydrate store
        useGameStore.setState({
            player: { ...useGameStore.getState().player, ...data.player },
            world: { ...useGameStore.getState().world, ...data.world },
            missions: { ...useGameStore.getState().missions, ...data.missions }
        });
        
        console.log('Game Loaded');
        return true;
    } catch (e) {
        console.error('Load Failed', e);
        return false;
    }
};

export const clearSave = () => {
    localStorage.removeItem(STORAGE_KEY);
};
