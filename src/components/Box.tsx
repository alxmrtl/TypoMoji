import React, { useEffect, useRef, useState } from 'react';
import type { GameMode } from '../types';
import './Box.css';

interface BoxProps {
  boxId: string;
  target: string;
  entered: string;
  locked: boolean;
  correct: boolean;
  mode: GameMode;
  onValidate: (boxId: string, entered: string) => void;
  onUpdateBox: (boxId: string, entered: string) => void;
  autoFocus?: boolean;
}

export const Box: React.FC<BoxProps> = ({
  boxId,
  target,
  entered,
  locked,
  correct,
  mode,
  onValidate,
  onUpdateBox,
  autoFocus = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (autoFocus && inputRef.current && !locked) {
      inputRef.current.focus();
    }
  }, [autoFocus, locked]);

  useEffect(() => {
    if (correct && !showSuccess) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 600);
    }
  }, [correct, showSuccess]);

  const getInputPattern = (): string => {
    switch (mode) {
      case 'LETTERS':
        return '[A-Za-z]';
      case 'NUMBERS':
        return '[0-9]*';
      case 'WORDS':
        return '[A-Za-z]*';
      default:
        return '.*';
    }
  };

  const getMaxLength = (): number => {
    switch (mode) {
      case 'LETTERS':
        return 1;
      case 'NUMBERS':
        return target.length;
      case 'WORDS':
        return target.length;
      default:
        return 20;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;

    let value = e.target.value.toUpperCase();

    // Filter based on mode
    switch (mode) {
      case 'LETTERS':
        value = value.replace(/[^A-Z]/g, '').slice(0, 1);
        break;
      case 'NUMBERS':
        value = value.replace(/[^0-9]/g, '');
        break;
      case 'WORDS':
        value = value.replace(/[^A-Z]/g, '');
        break;
    }

    onUpdateBox(boxId, value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (locked) return;

    if (e.key === 'Enter' || (mode === 'LETTERS' && entered.length === 1)) {
      handleValidation();
    }
  };

  const handleValidation = async () => {
    if (locked || !entered.trim()) return;

    const isValid = await new Promise<boolean>((resolve) => {
      // Simulate validation delay
      setTimeout(() => {
        onValidate(boxId, entered);
        resolve(entered === target);
      }, 100);
    });

    if (!isValid) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleBoxClick = () => {
    if (!locked && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className={`box ${locked ? 'box--locked' : ''} ${
        correct ? 'box--correct' : ''
      } ${isShaking ? 'box--shake' : ''} ${
        showSuccess ? 'box--success' : ''
      }`}
      onClick={handleBoxClick}
    >
      <div className="box__container">
        {locked && correct && (
          <div className="box__check" aria-hidden="true">
            ✓
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          value={entered}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleValidation}
          placeholder={target}
          disabled={locked}
          maxLength={getMaxLength()}
          pattern={getInputPattern()}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="box__input"
          aria-label={`Type ${target}`}
          aria-describedby={`box-hint-${boxId}`}
        />

        <div
          id={`box-hint-${boxId}`}
          className="box__hint"
          aria-hidden="true"
        >
          {target}
        </div>

        {/* Success sparkles */}
        {showSuccess && (
          <div className="box__sparkles" aria-hidden="true">
            <div className="box__sparkle box__sparkle--1">✨</div>
            <div className="box__sparkle box__sparkle--2">✨</div>
            <div className="box__sparkle box__sparkle--3">✨</div>
          </div>
        )}
      </div>
    </div>
  );
};