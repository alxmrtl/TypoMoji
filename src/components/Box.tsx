import React, { useEffect, useRef, useState } from 'react';
import type { GameMode, Equation } from '../types';
import './Box.css';

interface BoxProps {
  boxId: string;
  target: string;
  entered: string;
  locked: boolean;
  correct: boolean;
  mode: GameMode;
  emoji?: string;
  equation?: Equation;
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
  emoji,
  equation,
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
      case 'NUMBERS':
        return target.length > 0 ? target.length : 3;
      case 'WORDS':
        return target.length;
      default:
        return 20;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (locked) return;

    let value = e.target.value;

    // Filter based on mode
    switch (mode) {
      case 'NUMBERS':
        value = value.replace(/[^0-9]/g, '');
        break;
      case 'WORDS':
        value = value.toUpperCase().replace(/[^A-Z]/g, '');
        break;
    }

    onUpdateBox(boxId, value);

    // Auto-validate when target length is reached
    if (value.length === target.length && value.length > 0) {
      setTimeout(() => handleValidation(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (locked) return;

    if (e.key === 'Enter') {
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

  const renderContent = () => {
    if (mode === 'NUMBERS' && equation) {
      // Render equation format: "1 + _ = 5"
      return (
        <div className="box__equation">
          {emoji && (
            <div className="box__emoji box__emoji--numbers" aria-hidden="true">
              {emoji}
            </div>
          )}
          <div className="box__equation-display">
            <span className="box__equation-part">
              {equation.missing === 'left' ? (
                <input
                  ref={equation.missing === 'left' ? inputRef : undefined}
                  type="text"
                  value={equation.missing === 'left' ? entered : equation.left}
                  onChange={equation.missing === 'left' ? handleInputChange : undefined}
                  onKeyDown={equation.missing === 'left' ? handleKeyDown : undefined}
                  onBlur={equation.missing === 'left' ? handleValidation : undefined}
                  placeholder="?"
                  disabled={locked}
                  maxLength={getMaxLength()}
                  className="box__input--inline"
                  readOnly={equation.missing !== 'left'}
                />
              ) : (
                equation.left
              )}
            </span>
            <span className="box__equation-operator">{equation.operator}</span>
            <span className="box__equation-part">
              {equation.missing === 'right' ? (
                <input
                  ref={equation.missing === 'right' ? inputRef : undefined}
                  type="text"
                  value={equation.missing === 'right' ? entered : equation.right}
                  onChange={equation.missing === 'right' ? handleInputChange : undefined}
                  onKeyDown={equation.missing === 'right' ? handleKeyDown : undefined}
                  onBlur={equation.missing === 'right' ? handleValidation : undefined}
                  placeholder="?"
                  disabled={locked}
                  maxLength={getMaxLength()}
                  className="box__input--inline"
                  readOnly={equation.missing !== 'right'}
                />
              ) : (
                equation.right
              )}
            </span>
            <span className="box__equation-equals">=</span>
            <span className="box__equation-part">
              {equation.missing === 'result' ? (
                <input
                  ref={equation.missing === 'result' ? inputRef : undefined}
                  type="text"
                  value={equation.missing === 'result' ? entered : equation.result}
                  onChange={equation.missing === 'result' ? handleInputChange : undefined}
                  onKeyDown={equation.missing === 'result' ? handleKeyDown : undefined}
                  onBlur={equation.missing === 'result' ? handleValidation : undefined}
                  placeholder="?"
                  disabled={locked}
                  maxLength={getMaxLength()}
                  className="box__input--inline"
                  readOnly={equation.missing !== 'result'}
                />
              ) : (
                equation.result
              )}
            </span>
          </div>
        </div>
      );
    }

    // WORDS mode with emoji
    return (
      <>
        {emoji && (
          <div className="box__emoji" aria-hidden="true">
            {emoji}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          value={entered}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleValidation}
          placeholder=""
          disabled={locked}
          maxLength={getMaxLength()}
          pattern={getInputPattern()}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="box__input"
          aria-label={`Tape ${target}`}
        />
        {!entered && !correct && (
          <div className="box__hint">
            {target}
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className={`box ${locked ? 'box--locked' : ''} ${
        correct ? 'box--correct' : ''
      } ${isShaking ? 'box--shake' : ''} ${
        showSuccess ? 'box--success' : ''
      } box--${mode.toLowerCase()}`}
      onClick={handleBoxClick}
    >
      <div className="box__container">
        {locked && correct && (
          <div className="box__check" aria-hidden="true">
            ✓
          </div>
        )}

        {renderContent()}

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