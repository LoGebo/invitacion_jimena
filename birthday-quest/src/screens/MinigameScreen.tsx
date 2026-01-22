import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { ScratchReveal } from '../components/games/ScratchReveal';
import { TriviaVault } from '../components/games/TriviaVault';
import { BalloonPop } from '../components/games/BalloonPop';
import { FlowerPuzzle } from '../components/games/FlowerPuzzle';

const GAME_TITLES: Record<string, string> = {
  scratch: 'Rasca y Gana',
  trivia: 'Trivia',
  balloons: 'Explota Globos',
  flowers: 'Arma el Ramo',
};

const UNLOCK_CODE = '478912';

export function MinigameScreen() {
  const currentMinigame = useGameStore((s) => s.currentMinigame);
  const setPhase = useGameStore((s) => s.setPhase);
  const setCurrentMinigame = useGameStore((s) => s.setCurrentMinigame);
  const markGameComplete = useGameStore((s) => s.markGameComplete);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [showError, setShowError] = useState(false);

  // Show spinner briefly then code input
  useEffect(() => {
    if (currentMinigame) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 800);
      return () => clearTimeout(timer);
    }
  }, [currentMinigame]);

  const handleComplete = () => {
    if (currentMinigame) {
      markGameComplete(currentMinigame);
    }

    // Return to hub after short delay
    setTimeout(() => {
      setCurrentMinigame(null);
      setPhase('hub');
    }, 500);
  };

  const handleBack = () => {
    setCurrentMinigame(null);
    setIsLoading(true);
    setIsUnlocked(false);
    setCodeInput('');
    setShowError(false);
    setPhase('hub');
  };

  const handleCodeSubmit = () => {
    if (codeInput === UNLOCK_CODE) {
      setIsUnlocked(true);
      setShowError(false);
    } else {
      setShowError(true);
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  // Render the appropriate game
  const renderGame = () => {
    switch (currentMinigame) {
      case 'scratch':
        return <ScratchReveal onComplete={handleComplete} />;
      case 'trivia':
        return <TriviaVault onComplete={handleComplete} />;
      case 'balloons':
        return <BalloonPop onComplete={handleComplete} />;
      case 'flowers':
        return <FlowerPuzzle onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  if (!currentMinigame) {
    return null;
  }

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="w-full h-screen h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-lavender-mist to-soft-peach">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-dusty-rose/30 border-t-dusty-rose rounded-full"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-dusty-rose font-quicksand"
        >
          Cargando...
        </motion.p>
      </div>
    );
  }

  // Show code input screen if not unlocked
  if (!isUnlocked) {
    return (
      <div className="w-full h-screen h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-lavender-mist to-soft-peach p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-cottage max-w-sm w-full text-center"
        >
          <motion.div
            className="text-5xl mb-4"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔐
          </motion.div>

          <h2 className="font-comfortaa text-xl font-bold text-warm-terracotta mb-2">
            {GAME_TITLES[currentMinigame]}
          </h2>

          <p className="text-dusty-rose mb-4 text-sm">
            Ingresa el código para jugar
          </p>

          <input
            type="text"
            value={codeInput}
            onChange={(e) => {
              setCodeInput(e.target.value);
              setShowError(false);
            }}
            placeholder="Código..."
            className="input-cottage mb-3 text-center text-lg tracking-widest"
            maxLength={6}
          />

          {showError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-dusty-rose font-bold mb-3 text-sm"
            >
              No seas desesperada, espera el código 🥀
            </motion.p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 py-2 rounded-full bg-petal-white/50 text-dusty-rose font-quicksand border border-dusty-rose/30"
            >
              Volver
            </button>
            <button
              onClick={handleCodeSubmit}
              className="flex-1 btn-cottage"
            >
              Entrar 🎁
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen h-dvh flex flex-col overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 bg-petal-white/80 backdrop-blur-sm border-b border-dusty-rose/20 z-50"
      >
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-dusty-rose font-quicksand font-semibold rounded-full bg-petal-white/50 border border-dusty-rose/30 hover:bg-dusty-rose/10 transition-all"
        >
          <span>←</span>
          <span>Volver</span>
        </button>

        {/* Game title */}
        <h1 className="font-comfortaa font-bold text-warm-terracotta">
          {GAME_TITLES[currentMinigame] || 'Minijuego'}
        </h1>

        {/* Panda decoration */}
        <span className="text-2xl">🐼</span>
      </motion.div>

      {/* Game content */}
      <div className="flex-1 overflow-hidden">
        {renderGame()}
      </div>
    </div>
  );
}
