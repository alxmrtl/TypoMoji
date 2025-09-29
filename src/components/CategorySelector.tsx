import React from 'react';
import type { WordList, GameMode } from '../types';
import './CategorySelector.css';

interface CategorySelectorProps {
  lists: WordList[];
  mode: GameMode;
  onSelectList: (listId: string) => void;
  selectedListId?: string | null;
}

// Category mappings with emojis and French names
const getCategoryInfo = (list: WordList) => {
  if (list.id.includes('animals')) return { emoji: '🦁', name: 'Animaux', color: '#FF6B6B' };
  if (list.id.includes('food')) return { emoji: '🍎', name: 'Nourriture', color: '#4ECDC4' };
  if (list.id.includes('colors')) return { emoji: '🌈', name: 'Couleurs', color: '#45B7D1' };
  if (list.id.includes('body')) return { emoji: '👤', name: 'Corps', color: '#96CEB4' };
  if (list.id.includes('house')) return { emoji: '🏠', name: 'Maison', color: '#FFEAA7' };
  if (list.id.includes('equations')) return { emoji: '➕', name: 'Calculs', color: '#DDA0DD' };
  if (list.id.includes('numbers')) return { emoji: '🔢', name: 'Nombres', color: '#74B9FF' };

  // Fallback
  return { emoji: '📝', name: list.title, color: '#A29BFE' };
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  lists,
  mode,
  onSelectList,
  selectedListId
}) => {
  // Filter lists by current mode
  const availableLists = lists.filter(list => list.type === mode);

  if (availableLists.length === 0) {
    return (
      <div className="category-selector">
        <div className="category-selector__empty">
          <span className="category-selector__empty-emoji">🎯</span>
          <p>Aucune liste disponible pour ce mode</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-selector">
      <div className="category-selector__header">
        <h2 className="category-selector__title">
          {mode === 'WORDS' ? '📝 Choisis une catégorie' : '🔢 Choisis tes calculs'}
        </h2>
        <p className="category-selector__subtitle">
          Sélectionne ce que tu veux apprendre !
        </p>
      </div>

      <div className="category-selector__grid">
        {availableLists.map((list) => {
          const categoryInfo = getCategoryInfo(list);
          const isSelected = selectedListId === list.id;

          return (
            <button
              key={list.id}
              className={`category-card ${isSelected ? 'category-card--selected' : ''}`}
              onClick={() => onSelectList(list.id)}
              style={{ '--category-color': categoryInfo.color } as React.CSSProperties}
            >
              <div className="category-card__emoji">
                {categoryInfo.emoji}
              </div>
              <div className="category-card__content">
                <h3 className="category-card__name">
                  {categoryInfo.name}
                </h3>
                <p className="category-card__count">
                  {list.items.length} éléments
                </p>
              </div>
              {isSelected && (
                <div className="category-card__selected-indicator">
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};