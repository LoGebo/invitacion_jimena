import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface BalloonPopProps {
  onComplete: () => void;
}

interface Balloon {
  id: number;
  x: number;
  color: string;
  delay: number;
  popped: boolean;
}

const BALLOON_COLORS = [
  '#F8E1E7', // Blush pink
  '#FFECD2', // Soft peach
  '#E8E0F0', // Lavender
  '#D4E2D4', // Sage green
  '#E8C87D', // Honey gold
  '#D4A5A5', // Dusty rose
  '#5B9BD5', // Blue XV (Jimena's color)
];

const TOTAL_BALLOONS = 15;

export function BalloonPop({ onComplete }: BalloonPopProps) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);

  // Initialize balloons
  useEffect(() => {
    const initialBalloons: Balloon[] = Array.from({ length: TOTAL_BALLOONS }, (_, i) => ({
      id: i,
      x: 10 + (i % 5) * 18 + Math.random() * 5,
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      delay: Math.random() * 2,
      popped: false,
    }));
    setBalloons(initialBalloons);
  }, []);

  // Handle balloon pop
  const handlePop = (balloonId: number) => {
    if (isComplete) return;

    setBalloons(prev =>
      prev.map(b => (b.id === balloonId ? { ...b, popped: true } : b))
    );

    const newCount = poppedCount + 1;
    setPoppedCount(newCount);
    setRevealProgress((newCount / TOTAL_BALLOONS) * 100);

    // Vibrate on pop
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Mini confetti on pop
    confetti({
      particleCount: 10,
      spread: 30,
      origin: { y: 0.5 },
      colors: [BALLOON_COLORS[balloonId % BALLOON_COLORS.length]],
    });

    // Check for completion
    if (newCount >= TOTAL_BALLOONS) {
      setIsComplete(true);

      // Big confetti celebration
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: BALLOON_COLORS,
      });

      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 100]);
      }

      setTimeout(onComplete, 2000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-4 bg-gradient-to-b from-sky-cream to-butter-cream overflow-hidden relative">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-comfortaa text-2xl font-bold text-warm-terracotta mb-2 z-10"
      >
        🎈 Explota los Globos 🎈
      </motion.h2>

      {/* Progress */}
      <div className="w-full max-w-xs mb-4 z-10">
        <div className="h-3 bg-petal-white/50 rounded-full overflow-hidden border border-dusty-rose/30">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #D4A5A5, #E8C87D)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${revealProgress}%` }}
          />
        </div>
        <p className="text-sm text-dusty-rose text-center mt-1">
          {poppedCount} / {TOTAL_BALLOONS} globos
        </p>
      </div>

      {/* Instructions */}
      <p className="text-sm text-warm-terracotta/70 mb-4 z-10">
        Toca los globos para explotarlos 👆
      </p>

      {/* Balloons area */}
      <div className="flex-1 w-full relative overflow-hidden">
        <AnimatePresence>
          {balloons.map(balloon => !balloon.popped && (
            <motion.button
              key={balloon.id}
              initial={{ y: 400, opacity: 0 }}
              animate={{
                y: [300, -50, 280, -30, 260],
                opacity: 1,
                x: [0, 10, -10, 5, 0],
              }}
              exit={{
                scale: [1, 1.3, 0],
                opacity: [1, 1, 0],
                transition: { duration: 0.3 },
              }}
              transition={{
                y: {
                  duration: 6 + Math.random() * 2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: balloon.delay,
                  ease: 'easeInOut',
                },
                x: {
                  duration: 3,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: balloon.delay,
                },
              }}
              onClick={() => handlePop(balloon.id)}
              className="absolute cursor-pointer touch-none"
              style={{
                left: `${balloon.x}%`,
                transform: 'translateX(-50%)',
              }}
              whileTap={{ scale: 0.8 }}
            >
              {/* Balloon body */}
              <div
                className="relative"
                style={{
                  width: '50px',
                  height: '60px',
                }}
              >
                <svg viewBox="0 0 50 70" className="w-full h-full">
                  {/* Balloon shape */}
                  <ellipse
                    cx="25"
                    cy="25"
                    rx="22"
                    ry="25"
                    fill={balloon.color}
                    filter="url(#shadow)"
                  />
                  {/* Shine */}
                  <ellipse
                    cx="18"
                    cy="18"
                    rx="6"
                    ry="8"
                    fill="rgba(255,255,255,0.4)"
                  />
                  {/* Knot */}
                  <polygon
                    points="22,50 28,50 25,55"
                    fill={balloon.color}
                  />
                  {/* String */}
                  <path
                    d="M25,55 Q23,62 25,70"
                    stroke="#C9B99A"
                    strokeWidth="1"
                    fill="none"
                  />
                  <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.2"/>
                    </filter>
                  </defs>
                </svg>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        {/* Hidden gift reveal */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: revealProgress / 100,
            scale: 0.5 + (revealProgress / 100) * 0.5,
          }}
        >
          <div className="text-center">
            <motion.div
              className="text-6xl mb-2"
              animate={{ rotate: isComplete ? [0, 10, -10, 0] : 0 }}
              transition={{ duration: 0.5, repeat: isComplete ? 3 : 0 }}
            >
              🎁
            </motion.div>
            {isComplete && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-comfortaa font-bold text-warm-terracotta"
              >
                ¡Un regalo para ti! 🐼
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Success message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center z-10"
        >
          <p className="font-comfortaa font-bold text-xl text-honey-gold">
            ¡Increíble! 🎉
          </p>
        </motion.div>
      )}

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 text-2xl opacity-50">🐼</div>
      <div className="absolute bottom-20 left-4 text-xl opacity-30">🥑</div>
    </div>
  );
}
