import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { initializeSeedData, getDefaultListForMode } from './lib/seedData';
import { initializeAudio, audioManager } from './lib/audioManager';
import { ModeToggle } from './components/ModeToggle';
import { Board } from './components/Board';
import { CelebrationModal } from './components/CelebrationModal';
import { ParentZone } from './components/ParentZone';
import { AchievementNotification, achievements } from './components/AchievementNotification';
import './App.css';

function App() {
  const {
    config,
    lists,
    currentRound,
    selectedListId,
    loading,
    error,
    initializeStore,
    setMode,
    selectList,
    startNewRound,
    updateBoxEntry,
    validateBox,
    completeRound,
    clearError
  } = useGameStore();

  const [showParentZone, setShowParentZone] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<typeof achievements[keyof typeof achievements] | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize the app
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize storage and seed data
        await initializeSeedData();
        await initializeStore();
        await initializeAudio();

        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initialize();
  }, [initializeStore]);

  // Auto-select default list when mode changes
  useEffect(() => {
    if (!initialized || !lists.length) return;

    if (!selectedListId || !lists.find(l => l.id === selectedListId)) {
      const defaultList = getDefaultListForMode(config.mode);
      if (defaultList) {
        const existingList = lists.find(l => l.id === defaultList.id);
        if (existingList) {
          selectList(existingList.id);
        }
      }
    }
  }, [config.mode, lists, selectedListId, selectList, initialized]);

  // Auto-start round when list is selected and no active round
  useEffect(() => {
    if (selectedListId && !currentRound && initialized) {
      startNewRound();
    }
  }, [selectedListId, currentRound, startNewRound, initialized]);

  const handleModeChange = async (mode: string) => {
    if (mode === config.mode) return;

    await setMode(mode as any);

    // Find and select appropriate list for new mode
    const defaultList = getDefaultListForMode(mode);
    if (defaultList) {
      const existingList = lists.find(l => l.id === defaultList.id);
      if (existingList) {
        await selectList(existingList.id);
      }
    }
  };

  const handleBoxValidation = async (boxId: string) => {
    const isCorrect = await validateBox(boxId);

    if (isCorrect) {
      if (config.soundsEnabled) {
        await audioManager.playCorrectSound();
      }
      audioManager.vibrateSuccess();
    } else {
      if (config.soundsEnabled) {
        await audioManager.playIncorrectSound();
      }
      audioManager.vibrateError();
    }
  };

  const handleRoundComplete = async () => {
    await completeRound();

    if (config.soundsEnabled) {
      await audioManager.playCelebrationSound();
    }
    audioManager.vibrateCelebration();

    // Show achievement notification
    setCurrentAchievement(achievements['round-complete']);

    // Show celebration modal after achievement
    setTimeout(() => {
      setShowCelebration(true);
    }, 1000);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    // Start new round after celebration
    setTimeout(() => {
      startNewRound();
    }, 500);
  };

  const handleAchievementComplete = () => {
    setCurrentAchievement(null);
  };

  const handleNewRound = () => {
    startNewRound();
  };

  const selectedList = lists.find(l => l.id === selectedListId);

  if (loading || !initialized) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner">🎯</div>
        <p>Loading Fill & Celebrate...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            {config.mode === 'WORDS' && '📝 WORDS'}
            {config.mode === 'NUMBERS' && '🔢 NUMBERS'}
            {config.mode === 'LETTERS' && '🔤 LETTERS'}
          </h1>

          {/* Subtle parent button */}
          <button
            className="app-parent-button"
            onClick={() => setShowParentZone(true)}
            aria-label="Parent settings"
            title="Parent settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="app-main">
        <div className="container">
          {/* Error display */}
          {error && (
            <div className="app-error" role="alert">
              <p>{error}</p>
              <button onClick={clearError} className="app-error-dismiss">
                ✕
              </button>
            </div>
          )}

          {/* Mode toggle */}
          <ModeToggle
            currentMode={config.mode}
            onModeChange={handleModeChange}
            disabled={!!currentRound && !currentRound.completed}
          />

          {/* Game board */}
          {currentRound && selectedList ? (
            <Board
              roundState={currentRound}
              mode={config.mode}
              onValidate={handleBoxValidation}
              onUpdateBox={updateBoxEntry}
              onRoundComplete={handleRoundComplete}
            />
          ) : (
            <div className="app-waiting">
              <p>🎯 Get ready to type!</p>
              {selectedList && (
                <button
                  className="app-start-button"
                  onClick={handleNewRound}
                >
                  Start Round
                </button>
              )}
            </div>
          )}

          {/* New round button */}
          {selectedList && (!currentRound || currentRound.completed) && (
            <div className="app-actions">
              <button
                className="app-new-round-button"
                onClick={handleNewRound}
              >
                🎲 New Round
              </button>
            </div>
          )}

          {/* Current list info */}
          {selectedList && (
            <div className="app-list-info">
              <p>
                Playing: <strong>{selectedList.title}</strong> ({selectedList.items.length} items)
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Achievement Notification */}
      <AchievementNotification
        achievement={currentAchievement}
        onComplete={handleAchievementComplete}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        isVisible={showCelebration}
        onComplete={handleCelebrationComplete}
      />

      {/* Parent Zone */}
      <ParentZone
        isOpen={showParentZone}
        onClose={() => setShowParentZone(false)}
      />
    </div>
  );
}

export default App;
