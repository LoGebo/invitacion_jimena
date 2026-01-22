import { Scene } from '../components/3d/Scene';
import { Joystick } from '../components/ui/Joystick';
import { useGameStore } from '../stores/gameStore';
import { motion } from 'framer-motion';

export function WorldHub() {
  const completedGames = useGameStore((s) => s.completedGames);
  const allComplete = useGameStore((s) => s.allGamesCompleted());
  const setPhase = useGameStore((s) => s.setPhase);

  const handleSpecialGift = () => {
    setPhase('scanner');
  };

  return (
    <div className="w-full h-screen h-dvh relative overflow-hidden bg-sky-cream">
      {/* 3D Canvas */}
      <Scene />

      {/* Virtual Joystick */}
      <Joystick />

      {/* UI Overlay - Cottagecore Style */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40 pointer-events-none">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-cottage !p-4 pointer-events-auto"
        >
          <p className="text-sm font-quicksand text-dusty-rose">Regalos abiertos</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-comfortaa font-bold text-warm-terracotta">
              {completedGames.length}
            </span>
            <span className="text-warm-terracotta/60">/</span>
            <span className="text-lg text-warm-terracotta/60">4</span>
            {/* Flower indicators */}
            <div className="flex gap-1 ml-2">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`text-lg transition-all duration-300 ${
                    i < completedGames.length
                      ? 'opacity-100 scale-110'
                      : 'opacity-30 scale-100'
                  }`}
                >
                  {i < completedGames.length ? '🌸' : '🌱'}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Back to Plan button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="pointer-events-auto flex items-center gap-3"
        >
          <button
            onClick={() => setPhase('plan')}
            className="bg-petal-white/90 hover:bg-petal-white backdrop-blur-md rounded-full px-4 py-2 shadow-lg flex items-center gap-2 transition-all hover:scale-105"
          >
            <span className="text-lg">🌸</span>
            <span className="text-sm font-quicksand text-warm-terracotta font-semibold">
              Jardín
            </span>
          </button>
          <span className="text-3xl">🐼</span>
        </motion.div>
      </div>

      {/* Instructions hint - fades out after 20s */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-52 right-4 z-40 pointer-events-none"
      >
        <motion.p
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 20, duration: 1 }}
          className="text-xs text-warm-terracotta/70 font-quicksand text-center bg-petal-white/70 px-3 py-1.5 rounded-full backdrop-blur-sm"
        >
          Usa el joystick para moverte y acércate a los regalos 🎁
        </motion.p>
      </motion.div>

      {/* Special Gift Button - Shows when all games complete */}
      {allComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={handleSpecialGift}
            className="px-6 py-4 font-comfortaa font-bold text-lg rounded-full shadow-lg border-2 border-petal-white/50 animate-pulse-glow flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #E8C87D, #D4A574)',
              color: '#FFFBF7',
            }}
          >
            <span>Regalo Especial</span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🎁
            </motion.span>
          </button>
        </motion.div>
      )}

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-sky-cream/50 to-transparent pointer-events-none" />

      {/* Number 9 easter egg */}
      <div className="absolute bottom-4 right-4 opacity-10 text-2xl pointer-events-none">
        9
      </div>
    </div>
  );
}
