import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore } from '../stores/gameStore';

export function Finale() {
  const [showMessage, setShowMessage] = useState(false);
  const setPhase = useGameStore((s) => s.setPhase);

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 5000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#F8E1E7', '#FFECD2', '#D4E2D4', '#E8C87D', '#D4A5A5', '#E8E0F0', '#5B9BD5'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#F8E1E7', '#FFECD2', '#D4E2D4', '#E8C87D', '#D4A5A5', '#E8E0F0', '#5B9BD5'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Big burst
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#F8E1E7', '#FFECD2', '#D4E2D4', '#E8C87D', '#5B9BD5'],
    });

    // Show message after a delay
    setTimeout(() => setShowMessage(true), 1000);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blush-pink via-lavender-mist to-soft-peach flex items-center justify-center p-6 overflow-hidden">
      {/* Floating decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
            }}
            animate={{
              y: -100,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          >
            {['🌸', '💙', '🐼', '✨', '💕', '🎂', '🎁', '🌹'][i % 8]}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="max-w-md w-full text-center relative z-10"
      >
        {/* Animated emojis header */}
        <motion.div
          className="text-5xl mb-6 flex justify-center gap-2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🐼
          </motion.span>
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            💙
          </motion.span>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          >
            🎂
          </motion.span>
          <motion.span
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          >
            💙
          </motion.span>
          <motion.span
            animate={{ rotate: [10, -10, 10] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🐼
          </motion.span>
        </motion.div>

        {/* Main card */}
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-2 border-dusty-rose/30"
          >
            <motion.h1
              className="font-comfortaa text-3xl font-bold text-warm-terracotta mb-4"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ¡Feliz Cumpleaños Adelantado!
            </motion.h1>

            <h2 className="font-comfortaa text-4xl font-bold text-[#E84A5F] mb-6">
              Jimena
            </h2>

            <div className="space-y-4 text-warm-terracotta">
              <p className="text-lg leading-relaxed">
                Gracias por aceptar esta cita especial y por recorrer este pequeño mundo que hice para ti.
              </p>

              <p className="leading-relaxed">
                Espero haberte podido ver sonreír y haberte hecho feliz en tu día (aunque sea antes xd)
              </p>
            </div>

            {/* Decorative hearts */}
            <div className="flex justify-center gap-3 mt-6 text-2xl">
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
              >
                💙
              </motion.span>
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              >
                🐼
              </motion.span>
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              >
                💙
              </motion.span>
            </div>
          </motion.div>
        )}

        {/* Back buttons */}
        {showMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 flex gap-4 justify-center"
          >
            <button
              onClick={() => setPhase('plan')}
              className="bg-white/80 hover:bg-white backdrop-blur-md rounded-full px-5 py-3 shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <span className="text-lg">🌸</span>
              <span className="text-sm font-quicksand text-warm-terracotta font-semibold">
                Volver al Jardín
              </span>
            </button>
            <button
              onClick={() => setPhase('hub')}
              className="bg-white/80 hover:bg-white backdrop-blur-md rounded-full px-5 py-3 shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              <span className="text-lg">🎁</span>
              <span className="text-sm font-quicksand text-warm-terracotta font-semibold">
                Ver Regalos
              </span>
            </button>
          </motion.div>
        )}

        {/* Easter eggs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2 }}
          className="mt-8 flex justify-center gap-4 text-xl"
        >
          <span>🥑</span>
          <span>🍥</span>
          <span>⚡</span>
          <span>👠</span>
          <span>9️⃣</span>
        </motion.div>
      </motion.div>

      {/* Gradient overlays */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-blush-pink/50 to-transparent pointer-events-none" />
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-soft-brown/20 to-transparent pointer-events-none" />
    </div>
  );
}
