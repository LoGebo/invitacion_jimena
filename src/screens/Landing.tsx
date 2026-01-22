import { useState, useRef, useCallback, Suspense } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Sky, Cloud } from '@react-three/drei';
import confetti from 'canvas-confetti';
import { useGameStore } from '../stores/gameStore';
import { Avatar } from '../components/3d/Avatar';
import { Island } from '../components/3d/Island';
import { FelicidadesText } from '../components/3d/Text3D';
import { FollowCamera } from '../components/3d/FollowCamera';
import { Joystick } from '../components/ui/Joystick';

// 3D Scene for Landing - Mario 3D style
function LandingScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      style={{ touchAction: 'none' }}
      gl={{ antialias: true, alpha: false }}
    >
      {/* Perspective Camera - 3D depth like Mario */}
      <PerspectiveCamera
        makeDefault
        fov={60}
        near={0.1}
        far={1000}
        position={[0, 8, 12]}
      />

      {/* Camera follows player */}
      <FollowCamera offset={[0, 6, 10]} smoothness={0.06} />

      {/* Beautiful blue sky */}
      <Sky
        distance={450000}
        sunPosition={[50, 30, 50]}
        inclination={0.6}
        azimuth={0.25}
        rayleigh={0.5}
        turbidity={8}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <color attach="background" args={['#87CEEB']} />

      {/* Fluffy clouds */}
      <Cloud position={[-10, 15, -20]} speed={0.2} opacity={0.8} />
      <Cloud position={[10, 18, -25]} speed={0.15} opacity={0.7} />
      <Cloud position={[0, 20, -30]} speed={0.1} opacity={0.6} />
      <Cloud position={[-15, 16, -15]} speed={0.25} opacity={0.75} />
      <Cloud position={[15, 14, -18]} speed={0.18} opacity={0.65} />

      {/* Soft sky fog */}
      <fog attach="fog" args={['#E0F4FF', 20, 60]} />

      {/* Warm cottagecore lighting */}
      <ambientLight intensity={0.6} color="#FFF8E7" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        color="#FFE4B5"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight
        position={[-5, 10, -5]}
        intensity={0.4}
        color="#E8E0F0"
      />

      {/* Hemisphere light */}
      <hemisphereLight
        color="#87CEEB"
        groundColor="#D4E2D4"
        intensity={0.4}
      />

      {/* Point light for text glow */}
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#E8C87D" distance={20} />

      <Suspense fallback={null}>
        {/* Island / Ground */}
        <Island />

        {/* Player Avatar */}
        <Avatar />

        {/* 3D Felicidades Jimena Text */}
        <FelicidadesText />
      </Suspense>
    </Canvas>
  );
}

export function Landing() {
  const setPhase = useGameStore((s) => s.setPhase);
  const acceptDate = useGameStore((s) => s.acceptDate);
  const [showConfetti, setShowConfetti] = useState(false);

  // Position of "NO" button for evasion
  const noX = useMotionValue(0);
  const noY = useMotionValue(0);
  const springX = useSpring(noX, { stiffness: 500, damping: 30 });
  const springY = useSpring(noY, { stiffness: 500, damping: 30 });

  const noButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Evasion logic for "NO" button
  const handleNoHover = useCallback(
    (e: React.PointerEvent | React.TouchEvent) => {
      if (!noButtonRef.current || !containerRef.current) return;

      const btn = noButtonRef.current.getBoundingClientRect();
      const container = containerRef.current.getBoundingClientRect();

      let clientX: number, clientY: number;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const btnCenterX = btn.left + btn.width / 2;
      const btnCenterY = btn.top + btn.height / 2;

      const dx = btnCenterX - clientX;
      const dy = btnCenterY - clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 150) {
        const force = ((150 - distance) / 150) * 1.2;
        const moveX = (dx / distance) * force * 80;
        const moveY = (dy / distance) * force * 80;

        // Keep button within visible screen bounds
        const padding = 20;
        const maxX = (container.width / 2) - btn.width - padding;
        const maxY = 150; // Limit vertical movement

        let newX = noX.get() + moveX;
        let newY = noY.get() + moveY;

        // Clamp to bounds, if at corner teleport to random position
        if (Math.abs(newX) > maxX - 20 && Math.abs(newY) > maxY - 20) {
          // Teleport to a random visible position
          newX = (Math.random() - 0.5) * maxX * 0.8;
          newY = (Math.random() - 0.5) * maxY * 0.8;
        } else {
          newX = Math.max(-maxX, Math.min(maxX, newX));
          newY = Math.max(-maxY, Math.min(maxY, newY));
        }

        noX.set(newX);
        noY.set(newY);
      }
    },
    [noX, noY]
  );

  const handleYesClick = () => {
    setShowConfetti(true);
    acceptDate();

    const duration = 3000;
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

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#F8E1E7', '#FFECD2', '#D4E2D4', '#E8C87D', '#D4A5A5', '#5B9BD5'],
    });

    setTimeout(() => setPhase('plan'), 2000);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-screen h-dvh relative overflow-hidden"
      onPointerMove={handleNoHover}
      onTouchMove={handleNoHover}
    >
      {/* 3D Scene - Full screen Mario style */}
      <div className="absolute inset-0">
        <LandingScene />
      </div>

      {/* Virtual Joystick */}
      <Joystick />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-44 z-40">
        {/* Proposal Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="pointer-events-auto bg-petal-white/90 backdrop-blur-md rounded-3xl p-5 mx-4 shadow-2xl border-2 border-dusty-rose/30 max-w-sm"
        >
          {/* Panda decoration */}
          <motion.div
            className="text-center text-2xl mb-1"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🐼
          </motion.div>

          <p className="font-quicksand text-lg text-warm-terracotta text-center mb-3">
            ¿Quieres salir conmigo?
          </p>

          <p className="text-xs text-warm-terracotta/60 text-center mb-3">
            ~ En Jesús ~
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            {/* YES Button */}
            <motion.button
              onClick={handleYesClick}
              disabled={showConfetti}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 text-lg font-comfortaa font-bold rounded-full shadow-lg border-2 border-petal-white/50 disabled:opacity-50 transition-all duration-300 animate-pulse-glow"
              style={{
                background: 'linear-gradient(135deg, #5B9BD5, #7BB3E0)',
                color: '#FFFBF7',
              }}
            >
              ¡SÍ! 💙
            </motion.button>

            {/* NO Button (evasive) */}
            <motion.button
              ref={noButtonRef}
              style={{ x: springX, y: springY }}
              onPointerEnter={handleNoHover}
              onTouchStart={handleNoHover}
              className="px-6 py-2 bg-soft-brown/60 text-warm-terracotta text-base font-comfortaa font-bold rounded-full shadow-lg border-2 border-petal-white/50 pointer-events-auto backdrop-blur-sm"
            >
              No 🥀
            </motion.button>
          </div>
        </motion.div>

        {/* Transition message */}
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <div className="bg-petal-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-xl">
              <p className="text-lg text-warm-terracotta font-comfortaa font-bold">
                A donde iremos:
              </p>
              <motion.div
                className="text-2xl mt-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                🌸🐼💙🐼🌸
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Instructions hint - fades out after 20s */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute top-4 right-4 z-40 pointer-events-none"
      >
        <motion.p
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 20, duration: 1 }}
          className="text-xs text-white font-quicksand text-center bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md"
        >
          🎮 ¡Usa el joystick para explorar!
        </motion.p>
      </motion.div>

      {/* Number 9 easter egg */}
      <div className="absolute bottom-4 right-4 opacity-30 text-xl pointer-events-none z-50 text-white">
        9
      </div>
    </div>
  );
}
