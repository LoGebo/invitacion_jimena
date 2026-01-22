import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface ScratchRevealProps {
  onComplete: () => void;
}

export function ScratchReveal({ onComplete }: ScratchRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Draw kraft paper gradient scratch layer
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, '#D4A574');  // Terracotta
    gradient.addColorStop(0.5, '#C9B99A'); // Soft brown
    gradient.addColorStop(1, '#D4A574');   // Terracotta
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add some texture/pattern
    ctx.fillStyle = 'rgba(255, 248, 231, 0.1)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add hint text
    ctx.fillStyle = 'rgba(255, 251, 247, 0.4)';
    ctx.font = '16px Comfortaa';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Rasca aquí ✨', rect.width / 2, rect.height / 2);
  }, []);

  // Calculate scratched percentage
  const calculateProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) {
        transparentPixels++;
      }
    }

    return (transparentPixels / (pixels.length / 4)) * 100;
  }, []);

  // Scratch function
  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (x - rect.left) * scaleX / 2;
    const canvasY = (y - rect.top) * scaleY / 2;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();

    if (lastPosRef.current) {
      // Draw line from last position
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(canvasX, canvasY);
      ctx.lineWidth = 40;
      ctx.lineCap = 'round';
      ctx.stroke();
    } else {
      // Draw circle at current position
      ctx.arc(canvasX, canvasY, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPosRef.current = { x: canvasX, y: canvasY };

    // Update progress
    const newProgress = calculateProgress();
    setProgress(newProgress);

    // Check for win condition (70% revealed)
    if (newProgress >= 70 && !isComplete) {
      setIsComplete(true);

      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F8E1E7', '#FFECD2', '#D4E2D4', '#E8C87D'],
      });

      // Trigger vibration
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      setTimeout(onComplete, 1500);
    }
  }, [calculateProgress, isComplete, onComplete]);

  // Event handlers
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPosRef.current = null;

    const point = 'touches' in e ? e.touches[0] : e;
    scratch(point.clientX, point.clientY);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const point = 'touches' in e ? e.touches[0] : e;
    scratch(point.clientX, point.clientY);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-soft-peach to-blush-pink">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-comfortaa text-2xl font-bold text-warm-terracotta mb-4"
      >
        🎀 Rasca y Descubre 🎀
      </motion.h2>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="h-3 bg-petal-white/50 rounded-full overflow-hidden border border-dusty-rose/30">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #D4A5A5, #E8C87D)',
              width: `${Math.min(progress / 0.7, 100)}%`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress / 0.7, 100)}%` }}
          />
        </div>
        <p className="text-sm text-dusty-rose text-center mt-1">
          {Math.round(Math.min(progress / 0.7, 100))}% revelado
        </p>
      </div>

      {/* Scratch card container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative rounded-3xl overflow-hidden shadow-cottage-lg"
        style={{ width: '280px', height: '200px' }}
      >
        {/* Hidden message underneath */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-4"
          style={{
            background: 'linear-gradient(135deg, #E8E0F0, #F8E1E7)',
          }}
        >
          <span className="text-4xl mb-2">🐼💙</span>
          <p className="font-comfortaa font-bold text-warm-terracotta text-center text-lg">
            Eres increíble, te quiero
          </p>
        </div>

        {/* Scratch canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer touch-none"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </motion.div>

      {/* Instructions */}
      <p className="text-sm text-warm-terracotta/70 mt-4 text-center">
        Usa tu dedo o mouse para raspar 🖐️
      </p>

      {/* Success message */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 text-center"
        >
          <p className="font-comfortaa font-bold text-xl text-honey-gold">
            ¡Lo lograste! 🌸
          </p>
        </motion.div>
      )}
    </div>
  );
}
