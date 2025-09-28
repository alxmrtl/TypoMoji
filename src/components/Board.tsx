import React from 'react';
import type { RoundState, GameMode } from '../types';
import { Box } from './Box';
import './Board.css';

interface BoardProps {
  roundState: RoundState;
  mode: GameMode;
  onValidate: (boxId: string, entered: string) => void;
  onUpdateBox: (boxId: string, entered: string) => void;
  onRoundComplete?: () => void;
}

export const Board: React.FC<BoardProps> = ({
  roundState,
  mode,
  onValidate,
  onUpdateBox,
  onRoundComplete
}) => {
  const { boxOrder, boxStates, completed } = roundState;

  // Find the first unlocked box for auto-focus
  const firstUnlockedBoxId = boxOrder.find(
    boxId => !boxStates[boxId].locked && !boxStates[boxId].correct
  );

  // Calculate progress
  const totalBoxes = boxOrder.length;
  const completedBoxes = Object.values(boxStates).filter(box => box.correct).length;
  const progressPercentage = totalBoxes > 0 ? (completedBoxes / totalBoxes) * 100 : 0;

  const handleValidate = async (boxId: string, entered: string) => {
    onValidate(boxId, entered);

    // Check if this validation completes the round
    const updatedBoxStates = {
      ...boxStates,
      [boxId]: {
        ...boxStates[boxId],
        correct: entered === boxStates[boxId].target,
        locked: entered === boxStates[boxId].target
      }
    };

    const allComplete = Object.values(updatedBoxStates).every(box => box.correct);
    if (allComplete && onRoundComplete) {
      setTimeout(() => {
        onRoundComplete();
      }, 800); // Delay for animation
    }
  };

  return (
    <div className="board">
      {/* Progress indicator */}
      <div className="board__progress">
        <div className="board__progress-bar">
          <div
            className="board__progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="board__progress-text">
          <span className="board__progress-current">{completedBoxes}</span>
          <span className="board__progress-separator">/</span>
          <span className="board__progress-total">{totalBoxes}</span>
          <span className="board__progress-stars" aria-hidden="true">
            {Array.from({ length: completedBoxes }, (_, i) => (
              <span key={i} className="board__progress-star">⭐</span>
            ))}
          </span>
        </div>
      </div>

      {/* Game board */}
      <div className="board__grid">
        {boxOrder.map((boxId, index) => {
          const boxState = boxStates[boxId];
          return (
            <Box
              key={boxId}
              boxId={boxId}
              target={boxState.target}
              entered={boxState.entered}
              locked={boxState.locked}
              correct={boxState.correct}
              mode={mode}
              onValidate={handleValidate}
              onUpdateBox={onUpdateBox}
              autoFocus={boxId === firstUnlockedBoxId && index === 0}
            />
          );
        })}
      </div>

      {/* Completion status */}
      {completed && (
        <div className="board__completion" role="status" aria-live="polite">
          <span className="board__completion-text">🎉 Round Complete! 🎉</span>
        </div>
      )}
    </div>
  );
};