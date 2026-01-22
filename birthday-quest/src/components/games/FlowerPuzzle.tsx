import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface FlowerPuzzleProps {
  onComplete: () => void;
}

// Target flowers that should be in the vase
const TARGET_FLOWERS = ['🌸', '🌺', '🌷', '🌻'];

// All available flowers (targets + distractors)
const ALL_FLOWERS = ['🌸', '🌺', '🌷', '🌻', '🌼', '💐', '🌹', '🪻', '🪷', '🌱'];

interface DraggableFlowerProps {
  id: string;
  emoji: string;
  isPlaced: boolean;
}

function DraggableFlower({ id, emoji, isPlaced }: DraggableFlowerProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isPlaced,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 100 : 1,
      }
    : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        text-4xl p-2 rounded-xl cursor-grab active:cursor-grabbing
        transition-all duration-200 touch-none select-none
        ${isPlaced ? 'opacity-30' : 'opacity-100'}
        ${isDragging ? 'scale-125 shadow-lg' : 'scale-100'}
        bg-petal-white/70 border-2 border-sage-green/30
      `}
      whileHover={{ scale: isPlaced ? 1 : 1.1 }}
      whileTap={{ scale: isPlaced ? 1 : 0.95 }}
    >
      {emoji}
    </motion.div>
  );
}

interface VaseDropZoneProps {
  placedFlowers: string[];
  isComplete: boolean;
}

function VaseDropZone({ placedFlowers, isComplete }: VaseDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'vase',
  });

  return (
    <motion.div
      ref={setNodeRef}
      className={`
        relative w-48 h-56 flex flex-col items-center justify-end pb-4
        transition-all duration-300
        ${isOver ? 'scale-105' : 'scale-100'}
      `}
      animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Vase SVG */}
      <svg viewBox="0 0 120 150" className="absolute inset-0 w-full h-full">
        {/* Vase body */}
        <path
          d="M30,60 Q20,100 35,140 L85,140 Q100,100 90,60 Q85,50 75,45 L75,35 Q75,25 60,25 Q45,25 45,35 L45,45 Q35,50 30,60"
          fill="url(#vaseGradient)"
          stroke="#D4A574"
          strokeWidth="2"
        />
        {/* Vase rim */}
        <ellipse cx="60" cy="27" rx="18" ry="5" fill="#D4A574" />
        {/* Decorative pattern */}
        <circle cx="45" cy="90" r="5" fill="#F8E1E7" opacity="0.6" />
        <circle cx="75" cy="85" r="4" fill="#E8E0F0" opacity="0.6" />
        <circle cx="60" cy="110" r="6" fill="#FFECD2" opacity="0.6" />
        <defs>
          <linearGradient id="vaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFECD2" />
            <stop offset="50%" stopColor="#F8E1E7" />
            <stop offset="100%" stopColor="#E8E0F0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Placed flowers in vase */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-1 w-32">
        <AnimatePresence>
          {placedFlowers.map((flower, index) => (
            <motion.span
              key={`placed-${flower}-${index}`}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              className="text-3xl"
              style={{
                transform: `rotate(${(index - 1.5) * 15}deg)`,
              }}
            >
              {flower}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Drop hint */}
      {placedFlowers.length < 4 && (
        <motion.p
          className="absolute top-1/2 text-xs text-dusty-rose/60 text-center"
          animate={{ opacity: isOver ? 1 : 0.6 }}
        >
          {isOver ? '¡Suelta aquí!' : 'Arrastra flores'}
        </motion.p>
      )}
    </motion.div>
  );
}

export function FlowerPuzzle({ onComplete }: FlowerPuzzleProps) {
  const [placedFlowers, setPlacedFlowers] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [showError, setShowError] = useState(false);

  // Shuffle flowers on mount
  const [shuffledFlowers] = useState(() =>
    [...ALL_FLOWERS].sort(() => Math.random() - 0.5)
  );

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'vase') {
      const flowerId = active.id as string;
      const emoji = flowerId.split('-')[0];

      // Check if already placed
      if (placedFlowers.includes(emoji)) return;

      // Check if it's a target flower
      if (TARGET_FLOWERS.includes(emoji)) {
        const newPlaced = [...placedFlowers, emoji];
        setPlacedFlowers(newPlaced);
        setShowError(false);

        if (navigator.vibrate) navigator.vibrate(50);

        // Check for completion
        if (newPlaced.length === 4) {
          setIsComplete(true);

          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F8E1E7', '#FFECD2', '#D4E2D4', '#E8C87D', '#E8E0F0'],
          });

          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

          setTimeout(onComplete, 2000);
        }
      } else {
        // Wrong flower
        setShowError(true);
        if (navigator.vibrate) navigator.vibrate([100, 100]);

        setTimeout(() => setShowError(false), 1500);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-4 bg-gradient-to-br from-sage-green to-moss-green overflow-hidden">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-comfortaa text-2xl font-bold text-warm-terracotta mb-2"
      >
        💐 Arma el Ramo 💐
      </motion.h2>

      {/* Instructions */}
      <p className="text-sm text-petal-white/90 mb-3 text-center">
        Arrastra las 4 flores correctas al jarrón
      </p>

      {/* Target flowers hint */}
      <div className="flex gap-2 mb-3 card-cottage !p-2 !bg-petal-white/70">
        <span className="text-sm text-dusty-rose">Busca:</span>
        {TARGET_FLOWERS.map((f, i) => (
          <span
            key={i}
            className={`text-xl ${placedFlowers.includes(f) ? 'opacity-30' : ''}`}
          >
            {f}
          </span>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Vase drop zone */}
        <VaseDropZone placedFlowers={placedFlowers} isComplete={isComplete} />

        {/* Error message */}
        <AnimatePresence>
          {showError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-dusty-rose font-bold text-sm mb-2"
            >
              ¡Esa flor no va en el ramo! 🥀
            </motion.p>
          )}
        </AnimatePresence>

        {/* Flower selection grid */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          {shuffledFlowers.map((emoji, index) => (
            <DraggableFlower
              key={`${emoji}-${index}`}
              id={`${emoji}-${index}`}
              emoji={emoji}
              isPlaced={placedFlowers.includes(emoji)}
            />
          ))}
        </div>
      </DndContext>

      {/* Progress indicator */}
      <div className="mt-4 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < placedFlowers.length
                ? 'bg-honey-gold'
                : 'bg-petal-white/50'
            }`}
            animate={i < placedFlowers.length ? { scale: [1, 1.3, 1] } : {}}
          />
        ))}
      </div>

      {/* Success message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 text-center"
        >
          <p className="font-comfortaa font-bold text-xl text-honey-gold">
            ¡Hermoso ramo! 🌸
          </p>
          <p className="text-sm text-petal-white">Para ti, Jimena 💕</p>
        </motion.div>
      )}
    </div>
  );
}
