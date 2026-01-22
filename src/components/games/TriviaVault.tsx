import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { TRIVIA_BANK, DISTRACTOR_EMOJIS } from '../../data/trivia';

interface TriviaVaultProps {
  onComplete: () => void;
}

export function TriviaVault({ onComplete }: TriviaVaultProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedEmojis, setSelectedEmojis] = useState<Set<string>>(new Set());
  const [showError, setShowError] = useState(false);
  const [unlockedDigits, setUnlockedDigits] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Split questions into groups of 4
  const questionGroups = useMemo(() => {
    const groups: typeof TRIVIA_BANK[] = [];
    for (let i = 0; i < TRIVIA_BANK.length; i += 4) {
      groups.push(TRIVIA_BANK.slice(i, i + 4));
    }
    return groups;
  }, []);

  const currentQuestions = questionGroups[currentRound] || [];
  const totalRounds = questionGroups.length;

  // Create emoji grid for current round
  const emojiGrid = useMemo(() => {
    const correctAnswers = currentQuestions.map(q => q.answer);
    const distractors = DISTRACTOR_EMOJIS
      .filter(e => !correctAnswers.includes(e))
      .sort(() => Math.random() - 0.5)
      .slice(0, 16 - correctAnswers.length);
    return [...correctAnswers, ...distractors].sort(() => Math.random() - 0.5);
  }, [currentQuestions]);

  const correctAnswersSet = useMemo(
    () => new Set(currentQuestions.map(q => q.answer)),
    [currentQuestions]
  );

  // Handle emoji selection
  const handleEmojiClick = (emoji: string) => {
    if (isComplete) return;

    setShowError(false);
    const newSelected = new Set(selectedEmojis);

    if (newSelected.has(emoji)) {
      newSelected.delete(emoji);
    } else {
      if (newSelected.size >= currentQuestions.length) {
        const first = Array.from(newSelected)[0];
        newSelected.delete(first);
      }
      newSelected.add(emoji);
    }

    setSelectedEmojis(newSelected);
  };

  // Validate answers for current round
  const handleValidate = () => {
    if (selectedEmojis.size !== currentQuestions.length) {
      setShowError(true);
      if (navigator.vibrate) navigator.vibrate(200);
      return;
    }

    const isCorrect = Array.from(selectedEmojis).every(e => correctAnswersSet.has(e));

    if (isCorrect) {
      // Add digit for this round
      const newDigit = String(currentRound + 1);
      setUnlockedDigits(prev => [...prev, newDigit]);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F8E1E7', '#FFECD2', '#D4E2D4', '#E8C87D'],
      });

      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      // Check if this was the last round
      if (currentRound + 1 >= totalRounds) {
        setIsComplete(true);
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#F8E1E7', '#FFECD2', '#D4E2D4', '#E8C87D', '#5B9BD5'],
        });
        setTimeout(onComplete, 3000);
      } else {
        // Move to next round
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          setSelectedEmojis(new Set());
        }, 1000);
      }
    } else {
      setShowError(true);
      setSelectedEmojis(new Set());
      if (navigator.vibrate) navigator.vibrate([100, 100, 100]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-gradient-to-br from-lavender-mist to-sage-green overflow-y-auto">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-comfortaa text-2xl font-bold text-warm-terracotta text-center mb-2"
      >
        🧠 TRIVIA 🧠
      </motion.h2>

      {/* Progress */}
      <div className="flex justify-center items-center gap-2 mb-3">
        <span className="text-sm text-dusty-rose">Ronda {currentRound + 1} de {totalRounds}</span>
        <div className="flex gap-1">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i < currentRound ? 'bg-honey-gold' : i === currentRound ? 'bg-dusty-rose' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Unlocked digits */}
      {unlockedDigits.length > 0 && (
        <div className="flex justify-center gap-1 mb-3">
          <span className="text-xs text-dusty-rose">Código: </span>
          {unlockedDigits.map((digit, i) => (
            <span key={i} className="text-sm font-bold text-honey-gold">{digit}</span>
          ))}
        </div>
      )}

      {/* Questions for this round */}
      <div className="space-y-2 mb-3">
        {currentQuestions.map((q, index) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-cottage !p-2 !rounded-xl"
          >
            <p className="text-sm font-quicksand text-warm-terracotta">
              <span className="font-bold text-dusty-rose">{index + 1}.</span>{' '}
              {q.question}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {emojiGrid.map((emoji, index) => (
          <motion.button
            key={`${emoji}-${index}`}
            onClick={() => handleEmojiClick(emoji)}
            whileTap={{ scale: 0.9 }}
            className={`
              text-2xl p-2 rounded-xl transition-all duration-200
              ${selectedEmojis.has(emoji)
                ? 'bg-honey-gold/50 border-2 border-honey-gold shadow-lg scale-110'
                : 'bg-petal-white/70 border-2 border-transparent hover:border-dusty-rose/30'
              }
            `}
          >
            {emoji}
          </motion.button>
        ))}
      </div>

      {/* Selected emojis indicator */}
      <div className="flex justify-center gap-2 mb-3">
        {Array.from({ length: currentQuestions.length }).map((_, i) => {
          const selected = Array.from(selectedEmojis);
          return (
            <div
              key={i}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-xl
                transition-all duration-200
                ${selected[i]
                  ? 'bg-honey-gold/30 border-2 border-honey-gold'
                  : 'bg-petal-white/50 border-2 border-dashed border-dusty-rose/30'
                }
              `}
            >
              {selected[i] || '?'}
            </div>
          );
        })}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {showError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-dusty-rose font-bold mb-2 text-sm"
          >
            {selectedEmojis.size !== currentQuestions.length
              ? `Selecciona ${currentQuestions.length} emojis`
              : '¡Intenta de nuevo! 🥀'}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Validate button */}
      {!isComplete && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleValidate}
          disabled={selectedEmojis.size !== currentQuestions.length}
          className="btn-cottage mx-auto disabled:opacity-50 text-sm py-2 px-4"
        >
          Verificar 🌸
        </motion.button>
      )}

      {/* Success message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-2"
        >
          <p className="font-comfortaa font-bold text-xl text-honey-gold mb-2">
            ¡Completaste la Trivia! 🎉
          </p>
          <p className="text-dusty-rose text-sm">
            Código desbloqueado: {unlockedDigits.join('')}
          </p>
        </motion.div>
      )}
    </div>
  );
}
