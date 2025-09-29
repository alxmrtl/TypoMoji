import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { initializeSeedData, getDefaultListForMode } from './lib/seedData';
import { initializeAudio, audioManager } from './lib/audioManager';
import { ModeToggle } from './components/ModeToggle';
import { Board } from './components/Board';
import { CategorySelector } from './components/CategorySelector';
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

  // Auto-clear selected list when mode changes to show category selector
  useEffect(() => {
    if (!initialized || !lists.length) return;

    // Clear selection when mode changes to let user choose category
    if (selectedListId && lists.find(l => l.id === selectedListId)) {
      const currentList = lists.find(l => l.id === selectedListId);
      if (currentList && currentList.type !== config.mode) {
        selectList(null as any); // Clear selection to show category selector
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
        <p>Chargement de Remplis & Célèbre...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            {config.mode === 'WORDS' && '📝 MOTS'}
            {config.mode === 'NUMBERS' && '🔢 NOMBRES'}
          </h1>

          {/* Subtle parent button */}
          <button
            className="app-parent-button"
            onClick={() => setShowParentZone(true)}
            aria-label="Paramètres parentaux"
            title="Paramètres parentaux"
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
          ) : selectedList ? (
            <div className="app-waiting">
              <p>🎯 Prépare-toi à taper !</p>
              <button
                className="app-start-button"
                onClick={handleNewRound}
              >
                Commencer la Partie
              </button>
            </div>
          ) : (
            <CategorySelector
              lists={lists}
              mode={config.mode}
              onSelectList={selectList}
              selectedListId={selectedListId}
            />
          )}

          {/* New round button */}
          {selectedList && (!currentRound || currentRound.completed) && (
            <div className="app-actions">
              <button
                className="app-new-round-button"
                onClick={handleNewRound}
              >
                🎲 Nouvelle Partie
              </button>
            </div>
          )}

          {/* Current list info */}
          {selectedList && (
            <div className="app-list-info">
              <p>
                En cours : <strong>{selectedList.title}</strong> ({selectedList.items.length} éléments)
              </p>
              <button
                className="app-change-category-button"
                onClick={() => selectList(null as any)}
              >
                🔄 Changer de catégorie
              </button>
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
