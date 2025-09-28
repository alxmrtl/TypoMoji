import React from 'react';
import type { GameMode } from '../types';
import './ModeToggle.css';

interface ModeToggleProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

const modes: { value: GameMode; label: string; emoji: string }[] = [
  { value: 'LETTERS', label: 'Letters', emoji: '🔤' },
  { value: 'NUMBERS', label: 'Numbers', emoji: '🔢' },
  { value: 'WORDS', label: 'Words', emoji: '📝' }
];

export const ModeToggle: React.FC<ModeToggleProps> = ({
  currentMode,
  onModeChange,
  disabled = false
}) => {
  return (
    <div className="mode-toggle">
      <div className="mode-toggle__container">
        {modes.map((mode) => (
          <button
            key={mode.value}
            className={`mode-toggle__button ${
              currentMode === mode.value ? 'mode-toggle__button--active' : ''
            }`}
            onClick={() => onModeChange(mode.value)}
            disabled={disabled}
            aria-pressed={currentMode === mode.value}
            type="button"
          >
            <span className="mode-toggle__emoji" aria-hidden="true">
              {mode.emoji}
            </span>
            <span className="mode-toggle__label">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};