import { useGameStore } from './stores/gameStore';
import { Landing } from './screens/Landing';
import { DatePlanWorld } from './screens/DatePlanWorld';
import { WorldHub } from './screens/WorldHub';
import { MinigameScreen } from './screens/MinigameScreen';
import { FinalScanner } from './screens/FinalScanner';
import { Finale } from './screens/Finale';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const phase = useGameStore((s) => s.phase);
  const resetProgress = useGameStore((s) => s.resetProgress);

  const handleReset = () => {
    if (confirm('¿Reiniciar todo el progreso?')) {
      resetProgress();
    }
  };

  return (
    <div className="w-full min-h-screen min-h-dvh overflow-hidden">
      {/* Reset button - bottom left corner */}
      <button
        onClick={handleReset}
        className="fixed bottom-4 left-4 z-[100] bg-red-500/60 hover:bg-red-600 text-white w-8 h-8 rounded-full text-xs shadow-lg backdrop-blur-sm transition-all opacity-50 hover:opacity-100"
        title="Reiniciar"
      >
        🔄
      </button>

      <AnimatePresence mode="wait">
        {phase === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Landing />
          </motion.div>
        )}

        {phase === 'plan' && (
          <motion.div
            key="plan"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DatePlanWorld />
          </motion.div>
        )}

        {phase === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WorldHub />
          </motion.div>
        )}

        {phase === 'minigame' && (
          <motion.div
            key="minigame"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MinigameScreen />
          </motion.div>
        )}

        {phase === 'scanner' && (
          <motion.div
            key="scanner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FinalScanner />
          </motion.div>
        )}

        {phase === 'finale' && (
          <motion.div
            key="finale"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Finale />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
