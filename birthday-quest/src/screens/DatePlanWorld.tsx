import { useState, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Text, Float } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { Avatar } from '../components/3d/Avatar';
import { FollowCamera } from '../components/3d/FollowCamera';
import { PlanStation, PlanPath } from '../components/3d/PlanStation';
import { Panda, Cat, Rose, Olive, Heart, Sparkle } from '../components/3d/Decorations';
import { Joystick } from '../components/ui/Joystick';
import { DATE_PLAN, PLAN_PATH } from '../data/datePlan';
import type { PlanActivity } from '../data/datePlan';

// Beautiful decorated ground
function PlanGround() {
  return (
    <group>
      {/* Main grass platform with multiple layers */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color="#C8E6C9" />
      </mesh>

      {/* Inner lighter grass */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial color="#D4E2D4" />
      </mesh>

      {/* Decorative path area */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[10, 48]} />
        <meshStandardMaterial color="#E8E0D4" transparent opacity={0.3} />
      </mesh>

      {/* Outer ring decoration */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[15, 18, 64]} />
        <meshStandardMaterial color="#A8C69F" />
      </mesh>

      {/* Stone border */}
      {[...Array(24)].map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const r = 14.5;
        return (
          <mesh key={`stone-${i}`} position={[Math.cos(angle) * r, 0.1, Math.sin(angle) * r]} castShadow>
            <boxGeometry args={[0.8, 0.2, 0.5]} />
            <meshStandardMaterial color="#B8A99A" />
          </mesh>
        );
      })}
    </group>
  );
}

// Beautiful 3D Banner with text
function PlanTitle() {
  return (
    <group position={[0, 4.5, -10]}>
      {/* Main banner structure */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[10, 2.5, 0.4]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>

      {/* Decorative frame */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[10.4, 2.9, 0.1]} />
        <meshStandardMaterial color="#A67C52" />
      </mesh>

      {/* Inner panel */}
      <mesh position={[0, 0, 0.25]}>
        <boxGeometry args={[9.4, 2.1, 0.1]} />
        <meshStandardMaterial color="#FFECD2" />
      </mesh>

      {/* Birthday text with Float animation */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <Text
          position={[0, 0.4, 0.35]}
          fontSize={0.5}
          color="#D4A574"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#FFFFFF"
        >
          Feliz Cumpleaños Adelantado
        </Text>
        <Text
          position={[0, -0.35, 0.35]}
          fontSize={0.8}
          color="#E84A5F"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#FFFFFF"
        >
          ♥ Jimena ♥
        </Text>
      </Float>

      {/* Decorative hearts on banner */}
      <Heart position={[-4.2, 0, 0.3]} scale={0.8} />
      <Heart position={[4.2, 0, 0.3]} scale={0.8} />

      {/* Corner roses */}
      <Rose position={[-5.2, 1, 0]} scale={1.2} color="#E84A5F" />
      <Rose position={[5.2, 1, 0]} scale={1.2} color="#F8E1E7" />
      <Rose position={[-5.2, -1, 0]} scale={1.2} color="#F8E1E7" />
      <Rose position={[5.2, -1, 0]} scale={1.2} color="#E84A5F" />

      {/* Support posts */}
      <mesh position={[-4.5, -3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 5, 12]} />
        <meshStandardMaterial color="#A67C52" />
      </mesh>
      <mesh position={[4.5, -3, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 5, 12]} />
        <meshStandardMaterial color="#A67C52" />
      </mesh>

      {/* Sparkles around text */}
      <Sparkle position={[-3, 0.8, 0.5]} />
      <Sparkle position={[3, 0.8, 0.5]} />
      <Sparkle position={[0, 1.2, 0.5]} />
    </group>
  );
}

// Decorative elements scattered around the map
function MapDecorations() {
  return (
    <group>
      {/* Pandas in various positions */}
      <Panda position={[8, 0, 6]} scale={0.8} />
      <Panda position={[-9, 0, -5]} scale={0.7} />
      <Panda position={[7, 0, -8]} scale={0.9} />

      {/* Cats around the map */}
      <Cat position={[-7, 0, 7]} scale={0.8} color="#FF9F5A" />
      <Cat position={[10, 0, -2]} scale={0.7} color="#8B7355" />
      <Cat position={[-10, 0, 2]} scale={0.9} color="#FFE4B5" />

      {/* Rose gardens */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = 12;
        const colors = ['#E84A5F', '#F8E1E7', '#FF6B6B', '#FFB6C1'];
        return (
          <Rose
            key={`rose-${i}`}
            position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
            scale={0.8 + Math.random() * 0.4}
            color={colors[i % colors.length]}
          />
        );
      })}

      {/* Olive decorations */}
      <group position={[-6, 0.5, -8]}>
        <Olive position={[0, 0, 0]} scale={1.5} />
        <Olive position={[0.4, 0.1, 0.2]} scale={1.3} />
        <Olive position={[-0.3, 0.05, 0.3]} scale={1.4} />
      </group>
      <group position={[8, 0.5, 4]}>
        <Olive position={[0, 0, 0]} scale={1.5} />
        <Olive position={[0.3, 0.1, -0.2]} scale={1.2} />
      </group>

      {/* Hearts scattered */}
      <Heart position={[5, 0.5, 8]} scale={0.6} color="#E84A5F" />
      <Heart position={[-8, 0.5, -2]} scale={0.5} color="#F8E1E7" />
      <Heart position={[9, 0.5, -6]} scale={0.7} color="#FF6B6B" />

      {/* Floating sparkles */}
      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * Math.PI * 2;
        const r = 8 + Math.sin(i * 2) * 3;
        return (
          <Sparkle
            key={`sparkle-${i}`}
            position={[Math.cos(angle) * r, 1.5 + Math.sin(i) * 0.5, Math.sin(angle) * r]}
          />
        );
      })}

      {/* Small decorative trees/bushes */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + 0.3;
        const r = 16;
        return (
          <group key={`bush-${i}`} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}>
            <mesh position={[0, 0.4, 0]} castShadow>
              <sphereGeometry args={[0.6, 12, 12]} />
              <meshStandardMaterial color="#5D8A5D" />
            </mesh>
            <mesh position={[0.3, 0.3, 0.2]} castShadow>
              <sphereGeometry args={[0.4, 10, 10]} />
              <meshStandardMaterial color="#6B9B6B" />
            </mesh>
            <mesh position={[-0.2, 0.35, -0.15]} castShadow>
              <sphereGeometry args={[0.45, 10, 10]} />
              <meshStandardMaterial color="#4A7A4A" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// 3D Scene for Date Plan
function PlanScene({ onStationApproach }: { onStationApproach: (activity: PlanActivity) => void }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      style={{ touchAction: 'none' }}
      gl={{ antialias: true, alpha: false }}
    >
      <PerspectiveCamera
        makeDefault
        fov={60}
        near={0.1}
        far={1000}
        position={[0, 8, 12]}
      />

      <FollowCamera offset={[0, 6, 10]} smoothness={0.08} />

      {/* Beautiful gradient sky */}
      <color attach="background" args={['#87CEEB']} />

      {/* Enhanced lighting */}
      <ambientLight intensity={0.6} color="#FFF8E7" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        color="#FFE4B5"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-5, 10, -5]}
        intensity={0.4}
        color="#E8E0F0"
      />
      <hemisphereLight color="#87CEEB" groundColor="#D4E2D4" intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#FFD700" />

      <Suspense fallback={null}>
        {/* Ground */}
        <PlanGround />

        {/* Decorations */}
        <MapDecorations />

        {/* Avatar */}
        <Avatar />

        {/* Title Banner */}
        <PlanTitle />

        {/* Plan stations */}
        {DATE_PLAN.map((activity, index) => (
          <PlanStation
            key={activity.id}
            activity={activity}
            index={index}
            onApproach={onStationApproach}
          />
        ))}

        {/* Path connecting stations */}
        <PlanPath positions={PLAN_PATH} />
      </Suspense>
    </Canvas>
  );
}

// Netflix-style Movie Selector Modal with real posters
function MovieSelector({
  movies,
  onSelect,
  onClose
}: {
  movies: { id: string; title: string; poster: string }[];
  onSelect: (movieId: string) => void;
  onClose: () => void;
}) {
  const [hoveredMovie, setHoveredMovie] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[100] flex items-start justify-center p-4 overflow-y-auto pt-8 pb-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-2xl max-w-3xl w-full shadow-2xl overflow-visible"
        onClick={e => e.stopPropagation()}
      >
        {/* Netflix-style header */}
        <div className="relative h-24 bg-gradient-to-r from-red-600 via-red-700 to-red-800 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="text-center z-10">
            <h2 className="text-2xl font-bold text-white mb-1">🎬 CINE</h2>
            <p className="text-white/80 text-sm">Elige la película que quieras ver</p>
          </div>
        </div>

        {/* Movie grid with real posters */}
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {movies.map((movie) => {
              const isHovered = hoveredMovie === movie.id;

              return (
                <motion.button
                  key={movie.id}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setHoveredMovie(movie.id)}
                  onHoverEnd={() => setHoveredMovie(null)}
                  onClick={() => onSelect(movie.id)}
                  className={`relative aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 ${
                    isHovered ? 'shadow-2xl ring-2 ring-red-500' : 'shadow-lg'
                  }`}
                >
                  {/* Movie poster image */}
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Title overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-2 pt-8">
                    <p className="text-white font-semibold text-xs text-center leading-tight drop-shadow-lg">
                      {movie.title}
                    </p>
                  </div>

                  {/* Hover overlay with play button */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                    >
                      <div className="bg-white rounded-full p-2 shadow-lg">
                        <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Beautiful Map Modal for Carl's Jr
function MapModal({
  mapUrl,
  title,
  onClose
}: {
  mapUrl: string;
  title: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with Carl's Jr branding */}
        <div className="relative h-40 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 text-6xl">🍔</div>
            <div className="absolute bottom-4 right-4 text-4xl">🍟</div>
            <div className="absolute top-1/2 right-8 text-3xl">🥤</div>
          </div>
          <div className="text-center z-10">
            <div className="text-6xl mb-2">🍔</div>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">Carl's Jr.</h2>
            <p className="text-white/90 text-sm">Vegetariano</p>
          </div>
        </div>

        {/* Map preview */}
        <div className="p-5">
          <div className="relative rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-inner">
            <div className="aspect-video bg-gradient-to-br from-green-100 via-green-50 to-blue-50 relative">
              {/* Stylized map */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Roads */}
                <div className="absolute w-full h-2 bg-gray-300 top-1/2 transform -translate-y-1/2" />
                <div className="absolute h-full w-2 bg-gray-300 left-1/2 transform -translate-x-1/2" />

                {/* Location marker */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="relative z-10"
                >
                  <div className="text-5xl drop-shadow-lg">📍</div>
                </motion.div>

                {/* Buildings */}
                <div className="absolute top-4 left-4 text-2xl opacity-50">🏢</div>
                <div className="absolute top-8 right-8 text-xl opacity-50">🏬</div>
                <div className="absolute bottom-8 left-8 text-xl opacity-50">🏪</div>
                <div className="absolute bottom-4 right-4 text-2xl opacity-50">🌳</div>
              </div>

              {/* Location info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white font-semibold text-sm">Carl's Jr.</p>
                <p className="text-white/80 text-xs">Monterrey, Nuevo León</p>
              </div>
            </div>
          </div>

          {/* Open Maps button */}
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl text-center shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🗺️</span>
              <span>Abrir en Google Maps</span>
            </span>
          </a>

          <button
            onClick={onClose}
            className="mt-3 w-full py-2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DatePlanWorld() {
  const setPhase = useGameStore((s) => s.setPhase);
  const selectMovie = useGameStore((s) => s.selectMovie);
  const [currentActivity, setCurrentActivity] = useState<PlanActivity | null>(null);
  const [visitedStations, setVisitedStations] = useState<Set<string>>(new Set());
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<PlanActivity | null>(null);

  // No position reset - Avatar will use its stored position

  const handleStationApproach = (activity: PlanActivity) => {
    console.log('DatePlanWorld: Station approached', activity.id);
    console.log('DatePlanWorld: Avatar positions BEFORE setState', {
      target: useGameStore.getState().avatarPosition,
      actual: useGameStore.getState().avatarActualPosition
    });
    setCurrentActivity(activity);
    setVisitedStations(prev => new Set([...prev, activity.id]));
    // Check positions after state update
    setTimeout(() => {
      console.log('DatePlanWorld: Avatar positions AFTER setState', {
        target: useGameStore.getState().avatarPosition,
        actual: useGameStore.getState().avatarActualPosition
      });
    }, 100);
  };

  const handleActivityClick = (activity: PlanActivity) => {
    setSelectedActivity(activity);
    if (activity.type === 'movie') {
      setShowMovieModal(true);
    } else if (activity.type === 'map') {
      setShowMapModal(true);
    }
  };

  const handleMovieSelect = (movieId: string) => {
    selectMovie(movieId);
    setShowMovieModal(false);
  };

  const allVisited = visitedStations.size >= DATE_PLAN.length;

  const handleContinue = () => {
    setPhase('hub');
  };

  return (
    <div className="w-full h-screen h-dvh relative overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <PlanScene onStationApproach={handleStationApproach} />
      </div>

      {/* Joystick - hidden when movie modal is open */}
      {!showMovieModal && <Joystick />}

      {/* Progress indicator */}
      <div className="absolute top-4 left-4 z-40">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-petal-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-dusty-rose/20"
        >
          <p className="text-sm font-quicksand text-warm-terracotta mb-3 font-semibold">
            ✨ Estaciones
          </p>
          <div className="flex gap-2 flex-wrap max-w-[160px]">
            {DATE_PLAN.map((activity) => (
              <button
                key={activity.id}
                onClick={() => visitedStations.has(activity.id) && handleActivityClick(activity)}
                disabled={!visitedStations.has(activity.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all shadow-sm ${
                  visitedStations.has(activity.id)
                    ? 'bg-gradient-to-br from-moss-green to-emerald-600 text-white scale-110 cursor-pointer hover:scale-125 hover:shadow-lg'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {activity.icon}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity popup when approaching station */}
      <AnimatePresence>
        {currentActivity && (
          <motion.div
            key={currentActivity.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40"
          >
            <button
              onClick={() => handleActivityClick(currentActivity)}
              className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border-2 max-w-[280px] mx-4 hover:scale-105 transition-transform cursor-pointer"
              style={{ borderColor: currentActivity.color }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md"
                  style={{ background: `linear-gradient(135deg, ${currentActivity.color}, ${currentActivity.color}dd)` }}
                >
                  {currentActivity.icon}
                </div>
                <div>
                  <h3
                    className="font-comfortaa font-bold text-base"
                    style={{ color: currentActivity.color }}
                  >
                    {currentActivity.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {currentActivity.time}
                  </p>
                </div>
              </div>
              <p className="font-quicksand text-gray-700 text-center text-sm">
                {currentActivity.description}
              </p>
              {(currentActivity.type === 'movie' || currentActivity.type === 'map') && (
                <div className="mt-2 py-1.5 px-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                  <p className="text-xs text-center text-white font-bold">
                    👆 Toca para ver más
                  </p>
                </div>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue button when all visited */}
      <AnimatePresence>
        {allVisited && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-20 right-4 z-50"
          >
            <button
              onClick={handleContinue}
              className="px-6 py-3 font-comfortaa font-bold text-base rounded-2xl shadow-xl border-2 border-white/30 flex items-center gap-2 hover:scale-105 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #5B9BD5, #7BB3E0)',
                color: '#FFFFFF',
              }}
            >
              <span>¡Continuar!</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-lg"
              >
                →
              </motion.span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions - right of joystick */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-48 z-40 pointer-events-none"
      >
        <p className="text-sm text-white font-quicksand bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg">
          🎮 Camina hacia las estaciones
        </p>
      </motion.div>

      {/* Back to Hub button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 right-16 z-40"
      >
        <button
          onClick={() => setPhase('hub')}
          className="bg-white/90 hover:bg-white backdrop-blur-md rounded-full px-4 py-2 shadow-lg flex items-center gap-2 transition-all hover:scale-105"
        >
          <span className="text-lg">🏠</span>
          <span className="text-sm font-quicksand text-warm-terracotta font-semibold">
            Menú
          </span>
        </button>
      </motion.div>

      {/* Movie Selector Modal */}
      <AnimatePresence>
        {showMovieModal && selectedActivity?.extraData?.movies && (
          <MovieSelector
            movies={selectedActivity.extraData.movies}
            onSelect={handleMovieSelect}
            onClose={() => setShowMovieModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && selectedActivity?.extraData?.mapUrl && (
          <MapModal
            mapUrl={selectedActivity.extraData.mapUrl}
            title={selectedActivity.title}
            onClose={() => setShowMapModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
