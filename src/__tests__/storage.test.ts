import {
  getConfig,
  saveConfig,
  getLists,
  saveList,
  deleteList,
  getListById,
  saveRoundState,
  getRoundState,
  clearRoundState,
  getAchievements,
  addAchievement,
  defaultConfig
} from '../lib/storage';
import type { WordList, RoundState } from '../types';

describe('Storage Functions', () => {
  beforeEach(() => {
    // Clear IndexedDB before each test
    indexedDB.deleteDatabase('FillCelebrateTypingGame');
  });

  describe('Config Storage', () => {
    test('should return default config when no config exists', async () => {
      const config = await getConfig();
      expect(config).toEqual(defaultConfig);
    });

    test('should save and retrieve config', async () => {
      const newConfig = {
        ...defaultConfig,
        boxesPerRound: 8,
        soundsEnabled: false
      };

      await saveConfig(newConfig);
      const retrievedConfig = await getConfig();

      expect(retrievedConfig).toEqual(newConfig);
    });
  });

  describe('Word Lists Storage', () => {
    const mockList: WordList = {
      id: 'test-list',
      title: 'Test List',
      type: 'WORDS',
      items: [
        { id: 'item1', key: 'CAT', emoji: '🐱' },
        { id: 'item2', key: 'DOG', emoji: '🐶' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    test('should return empty array when no lists exist', async () => {
      const lists = await getLists();
      expect(lists).toEqual([]);
    });

    test('should save and retrieve word list', async () => {
      await saveList(mockList);
      const lists = await getLists();

      expect(lists).toHaveLength(1);
      expect(lists[0]).toEqual(mockList);
    });

    test('should update existing list', async () => {
      await saveList(mockList);

      const updatedList = {
        ...mockList,
        title: 'Updated Test List'
      };

      await saveList(updatedList);
      const lists = await getLists();

      expect(lists).toHaveLength(1);
      expect(lists[0].title).toBe('Updated Test List');
    });

    test('should delete list', async () => {
      await saveList(mockList);
      await deleteList(mockList.id);

      const lists = await getLists();
      expect(lists).toHaveLength(0);
    });

    test('should get list by id', async () => {
      await saveList(mockList);

      const retrievedList = await getListById(mockList.id);
      expect(retrievedList).toEqual(mockList);

      const nonExistentList = await getListById('non-existent');
      expect(nonExistentList).toBeNull();
    });
  });

  describe('Round State Storage', () => {
    const mockRoundState: RoundState = {
      roundId: 'test-round',
      listId: 'test-list',
      boxOrder: ['box1', 'box2'],
      boxStates: {
        box1: { target: 'CAT', entered: '', locked: false, correct: false },
        box2: { target: 'DOG', entered: '', locked: false, correct: false }
      },
      completed: false,
      startedAt: new Date().toISOString(),
      completedAt: null
    };

    test('should save and retrieve round state', async () => {
      await saveRoundState(mockRoundState);
      const retrievedState = await getRoundState();

      expect(retrievedState).toEqual(mockRoundState);
    });

    test('should clear round state', async () => {
      await saveRoundState(mockRoundState);
      await clearRoundState();

      const retrievedState = await getRoundState();
      expect(retrievedState).toBeNull();
    });
  });

  describe('Achievements Storage', () => {
    test('should return empty achievements when none exist', async () => {
      const achievements = await getAchievements();
      expect(achievements).toEqual({ badges: [] });
    });

    test('should add achievement', async () => {
      await addAchievement('round-complete');

      const achievements = await getAchievements();
      expect(achievements.badges).toHaveLength(1);
      expect(achievements.badges[0].id).toBe('round-complete');
    });

    test('should not add duplicate achievement', async () => {
      await addAchievement('round-complete');
      await addAchievement('round-complete');

      const achievements = await getAchievements();
      expect(achievements.badges).toHaveLength(1);
    });
  });
});