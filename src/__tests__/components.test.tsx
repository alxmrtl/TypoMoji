import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModeToggle } from '../components/ModeToggle';
import { Box } from '../components/Box';
import { Board } from '../components/Board';
import { AchievementNotification, achievements } from '../components/AchievementNotification';
import type { RoundState } from '../types';

describe('ModeToggle Component', () => {
  test('renders all mode buttons', () => {
    const mockOnModeChange = jest.fn();

    render(
      <ModeToggle
        currentMode="WORDS"
        onModeChange={mockOnModeChange}
      />
    );

    expect(screen.getByRole('button', { name: /letters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /numbers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /words/i })).toBeInTheDocument();
  });

  test('calls onModeChange when button is clicked', () => {
    const mockOnModeChange = jest.fn();

    render(
      <ModeToggle
        currentMode="WORDS"
        onModeChange={mockOnModeChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /numbers/i }));
    expect(mockOnModeChange).toHaveBeenCalledWith('NUMBERS');
  });

  test('shows active state for current mode', () => {
    const mockOnModeChange = jest.fn();

    render(
      <ModeToggle
        currentMode="LETTERS"
        onModeChange={mockOnModeChange}
      />
    );

    const lettersButton = screen.getByRole('button', { name: /letters/i });
    expect(lettersButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('disables buttons when disabled prop is true', () => {
    const mockOnModeChange = jest.fn();

    render(
      <ModeToggle
        currentMode="WORDS"
        onModeChange={mockOnModeChange}
        disabled={true}
      />
    );

    expect(screen.getByRole('button', { name: /letters/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /numbers/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /words/i })).toBeDisabled();
  });
});

describe('Box Component', () => {
  const defaultProps = {
    boxId: 'test-box',
    target: 'CAT',
    entered: '',
    locked: false,
    correct: false,
    mode: 'WORDS' as const,
    onValidate: jest.fn(),
    onUpdateBox: jest.fn()
  };

  test('renders with target as placeholder', () => {
    render(<Box {...defaultProps} />);

    const input = screen.getByLabelText('Type CAT');
    expect(input).toHaveAttribute('placeholder', 'CAT');
  });

  test('calls onUpdateBox when input changes', () => {
    const mockOnUpdateBox = jest.fn();

    render(
      <Box
        {...defaultProps}
        onUpdateBox={mockOnUpdateBox}
      />
    );

    const input = screen.getByLabelText('Type CAT');
    fireEvent.change(input, { target: { value: 'C' } });

    expect(mockOnUpdateBox).toHaveBeenCalledWith('test-box', 'C');
  });

  test('calls onValidate when Enter is pressed', () => {
    const mockOnValidate = jest.fn();

    render(
      <Box
        {...defaultProps}
        entered="CAT"
        onValidate={mockOnValidate}
      />
    );

    const input = screen.getByLabelText('Type CAT');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnValidate).toHaveBeenCalledWith('test-box', 'CAT');
  });

  test('shows check mark when correct and locked', () => {
    render(
      <Box
        {...defaultProps}
        correct={true}
        locked={true}
      />
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  test('enforces uppercase for WORDS mode', () => {
    const mockOnUpdateBox = jest.fn();

    render(
      <Box
        {...defaultProps}
        mode="WORDS"
        onUpdateBox={mockOnUpdateBox}
      />
    );

    const input = screen.getByLabelText('Type CAT');
    fireEvent.change(input, { target: { value: 'cat' } });

    expect(mockOnUpdateBox).toHaveBeenCalledWith('test-box', 'CAT');
  });

  test('restricts input to numbers for NUMBERS mode', () => {
    const mockOnUpdateBox = jest.fn();

    render(
      <Box
        {...defaultProps}
        target="123"
        mode="NUMBERS"
        onUpdateBox={mockOnUpdateBox}
      />
    );

    const input = screen.getByLabelText('Type 123');
    fireEvent.change(input, { target: { value: 'abc123' } });

    expect(mockOnUpdateBox).toHaveBeenCalledWith('test-box', '123');
  });

  test('restricts input to single letter for LETTERS mode', () => {
    const mockOnUpdateBox = jest.fn();

    render(
      <Box
        {...defaultProps}
        target="A"
        mode="LETTERS"
        onUpdateBox={mockOnUpdateBox}
      />
    );

    const input = screen.getByLabelText('Type A');
    fireEvent.change(input, { target: { value: 'ABC' } });

    expect(mockOnUpdateBox).toHaveBeenCalledWith('test-box', 'A');
  });
});

describe('Board Component', () => {
  const mockRoundState: RoundState = {
    roundId: 'test-round',
    listId: 'test-list',
    boxOrder: ['box1', 'box2'],
    boxStates: {
      box1: { target: 'CAT', entered: '', locked: false, correct: false },
      box2: { target: 'DOG', entered: 'DOG', locked: true, correct: true }
    },
    completed: false,
    startedAt: new Date().toISOString(),
    completedAt: null
  };

  test('renders correct number of boxes', () => {
    render(
      <Board
        roundState={mockRoundState}
        mode="WORDS"
        onValidate={jest.fn()}
        onUpdateBox={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Type CAT')).toBeInTheDocument();
    expect(screen.getByLabelText('Type DOG')).toBeInTheDocument();
  });

  test('shows progress correctly', () => {
    render(
      <Board
        roundState={mockRoundState}
        mode="WORDS"
        onValidate={jest.fn()}
        onUpdateBox={jest.fn()}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // completed boxes
    expect(screen.getByText('2')).toBeInTheDocument(); // total boxes
    expect(screen.getByText('⭐')).toBeInTheDocument(); // star for completed
  });

  test('shows completion message when round is completed', () => {
    const completedRound = {
      ...mockRoundState,
      completed: true,
      boxStates: {
        box1: { target: 'CAT', entered: 'CAT', locked: true, correct: true },
        box2: { target: 'DOG', entered: 'DOG', locked: true, correct: true }
      }
    };

    render(
      <Board
        roundState={completedRound}
        mode="WORDS"
        onValidate={jest.fn()}
        onUpdateBox={jest.fn()}
      />
    );

    expect(screen.getByText('🎉 Round Complete! 🎉')).toBeInTheDocument();
  });
});

describe('AchievementNotification Component', () => {
  test('does not render when no achievement', () => {
    const { container } = render(
      <AchievementNotification
        achievement={null}
        onComplete={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders achievement when provided', () => {
    render(
      <AchievementNotification
        achievement={achievements['round-complete']}
        onComplete={jest.fn()}
      />
    );

    expect(screen.getByText('Round Master!')).toBeInTheDocument();
    expect(screen.getByText('Completed a typing round')).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  test('calls onComplete after timeout', async () => {
    const mockOnComplete = jest.fn();

    render(
      <AchievementNotification
        achievement={achievements['round-complete']}
        onComplete={mockOnComplete}
      />
    );

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 4000 });
  });
});

describe('Responsive Design', () => {
  test('components render correctly on mobile viewport', () => {
    // Set mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <ModeToggle
        currentMode="WORDS"
        onModeChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /words/i })).toBeInTheDocument();
  });

  test('components render correctly on tablet viewport', () => {
    // Set tablet viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(
      <ModeToggle
        currentMode="WORDS"
        onModeChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /words/i })).toBeInTheDocument();
  });

  test('components render correctly on desktop viewport', () => {
    // Set desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(
      <ModeToggle
        currentMode="WORDS"
        onModeChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /words/i })).toBeInTheDocument();
  });
});