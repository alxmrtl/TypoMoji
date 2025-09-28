import type { WordList } from '../types';
import animalsData from '../assets/lists/animals.json';
import colorsData from '../assets/lists/colors.json';
import numbersData from '../assets/lists/numbers.json';
import lettersData from '../assets/lists/letters.json';

// Built-in seed lists
export const builtInLists: WordList[] = [
  animalsData as WordList,
  colorsData as WordList,
  numbersData as WordList,
  lettersData as WordList
];

// Initialize built-in lists in storage if they don't exist
export const initializeSeedData = async () => {
  const { getLists, saveList } = await import('./storage');

  try {
    const existingLists = await getLists();
    const existingIds = new Set(existingLists.map(list => list.id));

    // Add any missing built-in lists
    for (const builtInList of builtInLists) {
      if (!existingIds.has(builtInList.id)) {
        await saveList(builtInList);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize seed data:', error);
    return false;
  }
};

// Get default list for a mode
export const getDefaultListForMode = (mode: string): WordList | null => {
  switch (mode) {
    case 'WORDS':
      return builtInLists.find(list => list.id === 'animals-easy') || null;
    case 'NUMBERS':
      return builtInLists.find(list => list.id === 'numbers-1-20') || null;
    case 'LETTERS':
      return builtInLists.find(list => list.id === 'letters-a-z') || null;
    default:
      return null;
  }
};