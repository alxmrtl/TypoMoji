import localforage from 'localforage';
import type { AppConfig, WordList, RoundState, AchievementData, GameMode } from '../types';

// Configure localforage
localforage.config({
  name: 'FillCelebrateTypingGame',
  version: 1.0,
  storeName: 'gameData',
  description: 'Local storage for Fill & Celebrate typing game'
});

// Storage keys
const KEYS = {
  APP_CONFIG: 'appConfig',
  WORD_LISTS: 'wordLists',
  ROUND_STATE: 'roundState',
  ACHIEVEMENTS: 'achievements',
  SELECTED_LIST: 'selectedList'
} as const;

// Default configuration
export const defaultConfig: AppConfig = {
  mode: 'WORDS' as GameMode,
  palette: {
    bg: '#F3F7FF',
    primary: '#2B6CF6',
    accent: '#FFB400',
    boxBg: '#FFFFFF',
    boxBorder: '#DDE7FF'
  },
  boxesPerRound: 6,
  builtInTheme: 'animals',
  soundsEnabled: true,
  subtleParentButtonPosition: 'top-right'
};

// App Config Storage
export const getConfig = async (): Promise<AppConfig> => {
  try {
    const config = await localforage.getItem<AppConfig>(KEYS.APP_CONFIG);
    return config || defaultConfig;
  } catch (error) {
    console.warn('Failed to load config, using defaults:', error);
    return defaultConfig;
  }
};

export const saveConfig = async (config: AppConfig): Promise<void> => {
  try {
    await localforage.setItem(KEYS.APP_CONFIG, config);
  } catch (error) {
    console.error('Failed to save config:', error);
    throw new Error('Failed to save configuration');
  }
};

// Word Lists Storage
export const getLists = async (): Promise<WordList[]> => {
  try {
    const lists = await localforage.getItem<WordList[]>(KEYS.WORD_LISTS);
    return lists || [];
  } catch (error) {
    console.warn('Failed to load lists:', error);
    return [];
  }
};

export const saveList = async (list: WordList): Promise<void> => {
  try {
    const lists = await getLists();
    const existingIndex = lists.findIndex(l => l.id === list.id);

    if (existingIndex >= 0) {
      lists[existingIndex] = { ...list, updatedAt: new Date().toISOString() };
    } else {
      lists.push(list);
    }

    await localforage.setItem(KEYS.WORD_LISTS, lists);
  } catch (error) {
    console.error('Failed to save list:', error);
    throw new Error('Failed to save word list');
  }
};

export const deleteList = async (id: string): Promise<void> => {
  try {
    const lists = await getLists();
    const filteredLists = lists.filter(l => l.id !== id);
    await localforage.setItem(KEYS.WORD_LISTS, filteredLists);
  } catch (error) {
    console.error('Failed to delete list:', error);
    throw new Error('Failed to delete word list');
  }
};

export const getListById = async (id: string): Promise<WordList | null> => {
  try {
    const lists = await getLists();
    return lists.find(l => l.id === id) || null;
  } catch (error) {
    console.warn('Failed to get list by id:', error);
    return null;
  }
};

// Round State Storage
export const saveRoundState = async (state: RoundState): Promise<void> => {
  try {
    await localforage.setItem(KEYS.ROUND_STATE, state);
  } catch (error) {
    console.error('Failed to save round state:', error);
    throw new Error('Failed to save round state');
  }
};

export const getRoundState = async (): Promise<RoundState | null> => {
  try {
    return await localforage.getItem<RoundState>(KEYS.ROUND_STATE);
  } catch (error) {
    console.warn('Failed to load round state:', error);
    return null;
  }
};

export const clearRoundState = async (): Promise<void> => {
  try {
    await localforage.removeItem(KEYS.ROUND_STATE);
  } catch (error) {
    console.error('Failed to clear round state:', error);
  }
};

// Achievements Storage
export const getAchievements = async (): Promise<AchievementData> => {
  try {
    const achievements = await localforage.getItem<AchievementData>(KEYS.ACHIEVEMENTS);
    return achievements || { badges: [] };
  } catch (error) {
    console.warn('Failed to load achievements:', error);
    return { badges: [] };
  }
};

export const addAchievement = async (achievementId: string): Promise<void> => {
  try {
    const achievements = await getAchievements();
    const exists = achievements.badges.some(badge => badge.id === achievementId);

    if (!exists) {
      achievements.badges.push({
        id: achievementId,
        earnedAt: new Date().toISOString()
      });
      await localforage.setItem(KEYS.ACHIEVEMENTS, achievements);
    }
  } catch (error) {
    console.error('Failed to add achievement:', error);
    throw new Error('Failed to add achievement');
  }
};

// Selected List Storage
export const getSelectedListId = async (): Promise<string | null> => {
  try {
    return await localforage.getItem<string>(KEYS.SELECTED_LIST);
  } catch (error) {
    console.warn('Failed to load selected list:', error);
    return null;
  }
};

export const setSelectedListId = async (listId: string): Promise<void> => {
  try {
    await localforage.setItem(KEYS.SELECTED_LIST, listId);
  } catch (error) {
    console.error('Failed to save selected list:', error);
  }
};

// Utility function for exporting data
export const exportData = async () => {
  try {
    const [config, lists, achievements] = await Promise.all([
      getConfig(),
      getLists(),
      getAchievements()
    ]);

    return {
      config,
      lists,
      achievements,
      exportedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to export data:', error);
    throw new Error('Failed to export data');
  }
};

// Utility function for importing data
export const importData = async (data: {
  config?: AppConfig;
  lists?: WordList[];
  achievements?: AchievementData;
}): Promise<void> => {
  try {
    if (data.config) {
      await saveConfig(data.config);
    }

    if (data.lists) {
      await localforage.setItem(KEYS.WORD_LISTS, data.lists);
    }

    if (data.achievements) {
      await localforage.setItem(KEYS.ACHIEVEMENTS, data.achievements);
    }
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Failed to import data');
  }
};

// Storage health check
export const isStorageAvailable = async (): Promise<boolean> => {
  try {
    const testKey = '__storage_test__';
    await localforage.setItem(testKey, 'test');
    await localforage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('Storage not available:', error);
    return false;
  }
};