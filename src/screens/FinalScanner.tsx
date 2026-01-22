import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore } from '../stores/gameStore';

type ScanState = 'waiting' | 'scanning' | 'detected' | 'countdown' | 'flash' | 'reveal';

export function FinalScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanState, setScanState] = useState<ScanState>('waiting');
  const [countdown, setCountdown] = useState(3);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showManualCode, setShowManualCode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const setPhase = useGameStore((s) => s.setPhase);
  const setCatDetected = useGameStore((s) => s.setCatDetected);

  // Timer for showing manual fallback
  useEffect(() => {
    if (scanState === 'scanning') {
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [scanState]);

  // Show manual code option after 20 seconds
  useEffect(() => {
    if (elapsedTime >= 20 && !showManualCode) {
      setShowManualCode(true);
    }
  }, [elapsedTime, showManualCode]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanState('scanning');
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setShowManualCode(true);
    }
  }, []);

  // Capture frame from video
  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  // Mock detection (simulates finding something)
  // In production, this would call Claude Vision API
  const analyzeImage = useCallback(async () => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For demo purposes: randomly "detect" after a few attempts
    // In production: send to /api/analyze-image endpoint
    const detected = Math.random() > 0.7;
    return { detected };
  }, []);

  // Scanning loop
  useEffect(() => {
    if (scanState !== 'scanning') return;

    const interval = setInterval(async () => {
      const frame = captureFrame();
      if (!frame) return;

      const result = await analyzeImage();

      if (result.detected) {
        clearInterval(interval);
        handleDetection();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [scanState, captureFrame, analyzeImage]);

  // Handle detection
  const handleDetection = () => {
    setScanState('detected');
    setCatDetected(true);

    // Vibrate
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // Start countdown
    setTimeout(() => {
      setScanState('countdown');
      startCountdown();
    }, 1000);
  };

  // Countdown sequence
  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    const countInterval = setInterval(() => {
      count--;
      setCountdown(count);

      if (count <= 0) {
        clearInterval(countInterval);
        captureAndReveal();
      }
    }, 1000);
  };

  // Capture photo and show reveal
  const captureAndReveal = () => {
    setScanState('flash');

    // Flash effect
    setTimeout(() => {
      const image = captureFrame();
      setCapturedImage(image);
      setScanState('reveal');

      // Stop camera
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }

      // Fire confetti
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#F8E1E7', '#FFECD2', '#D4E2D4', '#E8C87D', '#5B9BD5'],
      });
    }, 300);
  };

  // Manual code validation
  const handleManualCode = () => {
    const validCodes = ['gatito', 'GATITO', '1234', 'panda', 'PANDA'];

    if (validCodes.includes(manualCode.trim())) {
      setCodeError(false);
      handleDetection();
    } else {
      setCodeError(true);
      if (navigator.vibrate) navigator.vibrate(200);
    }
  };

  // Continue to finale
  const handleContinue = () => {
    setPhase('finale');
  };

  return (
    <div className="w-full h-screen h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-butter-cream to-blush-pink p-6 overflow-hidden relative">
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Waiting state */}
      {scanState === 'waiting' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            className="text-6xl mb-4"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎁✨
          </motion.div>
          <h1 className="font-comfortaa text-2xl font-bold text-warm-terracotta mb-4">
            Regalo del Wilin y la Michin
          </h1>
          <p className="text-dusty-rose mb-6">
            siuu
          </p>
          <button
            onClick={startCamera}
            className="btn-cottage text-lg"
          >
            Activar Cámara 📷
          </button>

          {/* Manual option */}
          <button
            onClick={() => setShowManualCode(true)}
            className="block mt-4 text-sm text-dusty-rose/70 underline mx-auto"
          >
            ¿No puedes usar la cámara?
          </button>
        </motion.div>
      )}

      {/* Scanning state */}
      {(scanState === 'scanning' || scanState === 'detected' || scanState === 'countdown' || scanState === 'flash') && (
        <div className="relative w-full max-w-md">
          {/* Video feed */}
          <div className="relative rounded-3xl overflow-hidden shadow-cottage-lg border-4 border-petal-white">
            <video
              ref={videoRef}
              className="w-full aspect-[4/3] object-cover"
              playsInline
              muted
            />

            {/* Scanning overlay */}
            {scanState === 'scanning' && (
              <motion.div
                className="absolute inset-0 border-4 border-honey-gold/50 rounded-3xl"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {/* Detection indicator */}
            {scanState === 'detected' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/30"
              >
                <span className="text-6xl">🎉</span>
              </motion.div>
            )}

            {/* Countdown */}
            {scanState === 'countdown' && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40"
              >
                <motion.span
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="text-8xl font-comfortaa font-bold text-petal-white drop-shadow-lg"
                >
                  {countdown}
                </motion.span>
              </motion.div>
            )}

            {/* Flash effect */}
            {scanState === 'flash' && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-white"
              />
            )}
          </div>

          {/* Scanning instructions */}
          {scanState === 'scanning' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-4 text-dusty-rose"
            >
              Buscando... Apunta la cámara 📷
            </motion.p>
          )}
        </div>
      )}

      {/* Reveal state */}
      {scanState === 'reveal' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          {/* Captured image */}
          {capturedImage && (
            <motion.div
              initial={{ rotate: -5 }}
              animate={{ rotate: [5, -5, 5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative mb-6 mx-auto inline-block"
            >
              <img
                src={capturedImage}
                alt="Captured"
                className="w-64 h-48 object-cover rounded-2xl shadow-cottage-lg border-4 border-petal-white"
              />
              <div className="absolute -top-4 -right-4 text-4xl">🌸</div>
              <div className="absolute -bottom-4 -left-4 text-3xl">🐼</div>
            </motion.div>
          )}

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-comfortaa text-3xl font-bold text-warm-terracotta mb-4"
          >
            ¡Lo encontraste! 🎉
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-dusty-rose text-lg mb-6"
          >
            Tienes un mensaje especial esperándote...
          </motion.p>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={handleContinue}
            className="btn-cottage text-xl px-8 py-4"
          >
            Ver Mi Regalo 💝
          </motion.button>
        </motion.div>
      )}

      {/* Manual code modal */}
      <AnimatePresence>
        {showManualCode && scanState !== 'reveal' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
            onClick={() => setShowManualCode(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card-cottage max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-comfortaa text-xl font-bold text-warm-terracotta mb-4 text-center">
                Código Secreto 🔐
              </h2>
              <p className="text-sm text-dusty-rose mb-4 text-center">
                Pídele el código a Jesús si no puedes usar la cámara
              </p>

              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Escribe el código..."
                className={`input-cottage mb-4 ${codeError ? 'border-red-400' : ''}`}
              />

              {codeError && (
                <p className="text-red-400 text-sm mb-4 text-center">
                  Código incorrecto, intenta de nuevo 🥀
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowManualCode(false)}
                  className="flex-1 py-2 rounded-full bg-petal-white/50 text-dusty-rose font-quicksand"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleManualCode}
                  className="flex-1 btn-cottage"
                >
                  Verificar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorations */}
      <motion.div
        className="absolute top-8 right-8 text-3xl"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🐼
      </motion.div>
      <motion.div
        className="absolute bottom-8 left-8 text-2xl opacity-50"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🥑
      </motion.div>
    </div>
  );
}
