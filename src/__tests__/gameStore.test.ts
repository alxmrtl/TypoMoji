import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '../store/gameStore';
import type { WordList } from '../types';

// Mock the storage module
jest.mock('../lib/storage', () => ({
  getConfig: jest.fn().mockResolvedValue({
    mode: 'WORDS',
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
  }),
  saveConfig: jest.fn().mockResolvedValue(undefined),
  getLists: jest.fn().mockResolvedValue([]),
  saveList: jest.fn().mockResolvedValue(undefined),
  deleteList: jest.fn().mockResolvedValue(undefined),
  getRoundState: jest.fn().mockResolvedValue(null),
  saveRoundState: jest.fn().mockResolvedValue(undefined),
  clearRoundState: jest.fn().mockResolvedValue(undefined),
  getSelectedListId: jest.fn().mockResolvedValue(null),
  setSelectedListId: jest.fn().mockResolvedValue(undefined),
  getAchievements: jest.fn().mockResolvedValue({ badges: [] }),
  addAchievement: jest.fn().mockResolvedValue(undefined),
  exportData: jest.fn().mockResolvedValue({}),
  importData: jest.fn().mockResolvedValue(undefined)
}));

describe('Game Store', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useGameStore.setState({
      config: {
        mode: 'WORDS',
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
      error: null
    });
  });

  test('should initialize with default state', () => {
    const { result } = renderHook(() => useGameStore());

    expect(result.current.config.mode).toBe('WORDS');
    expect(result.current.lists).toEqual([]);
    expect(result.current.currentRound).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  test('should update config', async () => {
    const { result } = renderHook(() => useGameStore());

    await act(async () => {
      await result.current.updateConfig({ boxesPerRound: 8 });
    });

    expect(result.current.config.boxesPerRound).toBe(8);
  });

  test('should set mode', async () => {
    const { result } = renderHook(() => useGameStore());

    await act(async () => {
      await result.current.setMode('NUMBERS');
    });

    expect(result.current.config.mode).toBe('NUMBERS');
  });

  test('should create new list', async () => {
    const { result } = renderHook(() => useGameStore());

    await act(async () => {
      await result.current.createList('Test List', 'WORDS');
    });

    expect(result.current.lists).toHaveLength(1);
    expect(result.current.lists[0].title).toBe('Test List');
  });

  test('should remove list', async () => {
    const { result } = renderHook(() => useGameStore());

    // First create a list
    await act(async () => {
      await result.current.createList('Test List', 'WORDS');
    });

    const listId = result.current.lists[0].id;

    // Then remove it
    await act(async () => {
      await result.current.removeList(listId);
    });

    expect(result.current.lists).toHaveLength(0);
  });

  test('should start new round when list is available', async () => {
    const { result } = renderHook(() => useGameStore());

    // Create a list with items
    const mockList: WordList = {
      id: 'test-list',
      title: 'Test List',
      type: 'WORDS',
      items: [
        { id: 'item1', key: 'CAT', emoji: '🐱' },
        { id: 'item2', key: 'DOG', emoji: '🐶' },
        { id: 'item3', key: 'FISH', emoji: '🐠' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Manually set the list and select it
    useGameStore.setState({
      lists: [mockList],
      selectedListId: mockList.id
    });

    await act(async () => {
      await result.current.startNewRound();
    });

    expect(result.current.currentRound).not.toBeNull();
    expect(result.current.currentRound?.listId).toBe(mockList.id);
    expect(Object.keys(result.current.currentRound?.boxStates || {})).toHaveLength(6);
  });

  test('should validate box entry correctly', async () => {
    const { result } = renderHook(() => useGameStore());

    // Set up a round manually
    const mockRound = {
      roundId: 'test-round',
      listId: 'test-list',
      boxOrder: ['box1'],
      boxStates: {
        box1: { target: 'CAT', entered: 'CAT', locked: false, correct: false }
      },
      completed: false,
      startedAt: new Date().toISOString(),
      completedAt: null
    };

    useGameStore.setState({ currentRound: mockRound });

    await act(async () => {
      const isCorrect = await result.current.validateBox('box1');
      expect(isCorrect).toBe(true);
    });

    expect(result.current.currentRound?.boxStates.box1.correct).toBe(true);
    expect(result.current.currentRound?.boxStates.box1.locked).toBe(true);
  });

  test('should handle errors gracefully', () => {
    const { result } = renderHook(() => useGameStore());

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});