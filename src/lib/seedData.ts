import type { WordList } from '../types';
import numbersData from '../assets/lists/numbers.json';
import animalsFrenchData from '../assets/lists/animals-french.json';
import foodFrenchData from '../assets/lists/food-french.json';
import colorsFrenchData from '../assets/lists/colors-french.json';
import bodyFrenchData from '../assets/lists/body-french.json';
import houseFrenchData from '../assets/lists/house-french.json';
import equationsFrenchData from '../assets/lists/equations-french.json';

// Built-in seed lists - French only
export const builtInLists: WordList[] = [
  numbersData as WordList,
  animalsFrenchData as WordList,
  foodFrenchData as WordList,
  colorsFrenchData as WordList,
  bodyFrenchData as WordList,
  houseFrenchData as WordList,
  equationsFrenchData as WordList
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
      return builtInLists.find(list => list.id === 'animals-french') || null;
    case 'NUMBERS':
      return builtInLists.find(list => list.id === 'equations-french') || null;
    default:
      return null;
  }
};