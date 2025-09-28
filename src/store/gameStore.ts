import { create } from 'zustand';
import type { AppConfig, WordList, RoundState, GameMode, BoxState } from '../types';
import {
  getConfig,
  saveConfig,
  getLists,
  saveList,
  deleteList,
  getRoundState,
  saveRoundState,
  clearRoundState,
  getSelectedListId,
  setSelectedListId,
  addAchievement,
  getAchievements
} from '../lib/storage';

interface GameStore {
  // State
  config: AppConfig;
  lists: WordList[];
  currentRound: RoundState | null;
  selectedListId: string | null;
  achievements: string[];
  loading: boolean;
  error: string | null;

  // Actions
  initializeStore: () => Promise<void>;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  setMode: (mode: GameMode) => Promise<void>;

  // List management
  createList: (title: string, type: GameMode) => Promise<string>;
  updateList: (list: WordList) => Promise<void>;
  removeList: (id: string) => Promise<void>;
  selectList: (id: string) => Promise<void>;

  // Round management
  startNewRound: () => Promise<void>;
  updateBoxEntry: (boxId: string, entered: string) => Promise<void>;
  validateBox: (boxId: string) => Promise<boolean>;
  completeRound: () => Promise<void>;

  // Utility
  setError: (error: string | null) => void;
  clearError: () => void;
  exportData: () => Promise<any>;
  importData: (data: any) => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  config: {
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
  },
  lists: [],
  currentRound: null,
  selectedListId: null,
  achievements: [],
  loading: false,
  error: null,

  // Initialize store with data from storage
  initializeStore: async () => {
    set({ loading: true, error: null });

    try {
      const [config, lists, selectedListId, achievementData] = await Promise.all([
        getConfig(),
        getLists(),
        getSelectedListId(),
        getAchievements()
      ]);

      // Try to restore round state
      const roundState = await getRoundState();

      set({
        config,
        lists,
        selectedListId,
        currentRound: roundState,
        achievements: achievementData.badges.map(b => b.id),
        loading: false
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({
        error: 'Failed to load game data',
        loading: false
      });
    }
  },

  // Update configuration
  updateConfig: async (updates) => {
    const { config } = get();
    const newConfig = { ...config, ...updates };

    try {
      await saveConfig(newConfig);
      set({ config: newConfig });
    } catch (error) {
      console.error('Failed to update config:', error);
      set({ error: 'Failed to save settings' });
    }
  },

  // Set game mode
  setMode: async (mode) => {
    const { updateConfig } = get();
    await updateConfig({ mode });
  },

  // Create new word list
  createList: async (title, type) => {
    const newList: WordList = {
      id: crypto.randomUUID(),
      title,
      type,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await saveList(newList);
      const { lists } = get();
      set({ lists: [...lists, newList] });
      return newList.id;
    } catch (error) {
      console.error('Failed to create list:', error);
      set({ error: 'Failed to create word list' });
      throw error;
    }
  },

  // Update existing word list
  updateList: async (updatedList) => {
    try {
      await saveList(updatedList);
      const { lists } = get();
      const newLists = lists.map(list =>
        list.id === updatedList.id ? updatedList : list
      );
      set({ lists: newLists });
    } catch (error) {
      console.error('Failed to update list:', error);
      set({ error: 'Failed to update word list' });
    }
  },

  // Remove word list
  removeList: async (id) => {
    try {
      await deleteList(id);
      const { lists, selectedListId } = get();
      const newLists = lists.filter(list => list.id !== id);

      // Clear selection if we deleted the selected list
      const newSelectedListId = selectedListId === id ? null : selectedListId;

      set({
        lists: newLists,
        selectedListId: newSelectedListId
      });
    } catch (error) {
      console.error('Failed to remove list:', error);
      set({ error: 'Failed to delete word list' });
    }
  },

  // Select active word list
  selectList: async (id) => {
    try {
      await setSelectedListId(id);
      set({ selectedListId: id });
    } catch (error) {
      console.error('Failed to select list:', error);
      set({ error: 'Failed to select word list' });
    }
  },

  // Start new round
  startNewRound: async () => {
    const { selectedListId, lists, config } = get();

    if (!selectedListId) {
      set({ error: 'No word list selected' });
      return;
    }

    const selectedList = lists.find(list => list.id === selectedListId);
    if (!selectedList || selectedList.items.length === 0) {
      set({ error: 'Selected word list is empty' });
      return;
    }

    // Generate random selection of items
    const shuffledItems = [...selectedList.items].sort(() => Math.random() - 0.5);
    const roundItems = shuffledItems.slice(0, Math.min(config.boxesPerRound, shuffledItems.length));

    // Create box states
    const boxStates: Record<string, BoxState> = {};
    const boxOrder: string[] = [];

    roundItems.forEach(item => {
      const boxId = crypto.randomUUID();
      boxOrder.push(boxId);
      boxStates[boxId] = {
        target: item.key,
        entered: '',
        locked: false,
        correct: false
      };
    });

    // Shuffle box order for random placement
    boxOrder.sort(() => Math.random() - 0.5);

    const newRound: RoundState = {
      roundId: crypto.randomUUID(),
      listId: selectedListId,
      boxOrder,
      boxStates,
      completed: false,
      startedAt: new Date().toISOString(),
      completedAt: null
    };

    try {
      await saveRoundState(newRound);
      set({ currentRound: newRound });
    } catch (error) {
      console.error('Failed to start new round:', error);
      set({ error: 'Failed to start new round' });
    }
  },

  // Update box entry
  updateBoxEntry: async (boxId, entered) => {
    const { currentRound } = get();
    if (!currentRound || currentRound.completed) return;

    const updatedRound = {
      ...currentRound,
      boxStates: {
        ...currentRound.boxStates,
        [boxId]: {
          ...currentRound.boxStates[boxId],
          entered: entered.toUpperCase() // Enforce uppercase
        }
      }
    };

    try {
      await saveRoundState(updatedRound);
      set({ currentRound: updatedRound });
    } catch (error) {
      console.error('Failed to update box entry:', error);
    }
  },

  // Validate box entry
  validateBox: async (boxId) => {
    const { currentRound } = get();
    if (!currentRound || currentRound.completed) return false;

    const box = currentRound.boxStates[boxId];
    if (!box || box.locked) return false;

    const isCorrect = box.entered === box.target;

    if (isCorrect) {
      const updatedRound = {
        ...currentRound,
        boxStates: {
          ...currentRound.boxStates,
          [boxId]: {
            ...box,
            correct: true,
            locked: true
          }
        }
      };

      try {
        await saveRoundState(updatedRound);
        set({ currentRound: updatedRound });

        // Check if round is complete
        const allBoxesCorrect = Object.values(updatedRound.boxStates)
          .every(boxState => boxState.correct);

        if (allBoxesCorrect) {
          setTimeout(() => {
            get().completeRound();
          }, 500); // Delay to let animation play
        }
      } catch (error) {
        console.error('Failed to validate box:', error);
      }
    }

    return isCorrect;
  },

  // Complete round
  completeRound: async () => {
    const { currentRound } = get();
    if (!currentRound || currentRound.completed) return;

    const completedRound = {
      ...currentRound,
      completed: true,
      completedAt: new Date().toISOString()
    };

    try {
      await saveRoundState(completedRound);

      // Add achievement
      await addAchievement('round-complete');

      // Clear round state after completion
      setTimeout(async () => {
        await clearRoundState();
        set({ currentRound: null });
      }, 3000); // Clear after celebration animation

      set({
        currentRound: completedRound,
        achievements: [...get().achievements, 'round-complete']
      });
    } catch (error) {
      console.error('Failed to complete round:', error);
      set({ error: 'Failed to complete round' });
    }
  },

  // Error management
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Data management
  exportData: async () => {
    try {
      const { exportData } = await import('../lib/storage');
      return await exportData();
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  },

  importData: async (data) => {
    try {
      const { importData } = await import('../lib/storage');
      await importData(data);

      // Refresh store data
      const [config, lists] = await Promise.all([
        import('../lib/storage').then(m => m.getConfig()),
        import('../lib/storage').then(m => m.getLists())
      ]);

      set({ config, lists });
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }
}));