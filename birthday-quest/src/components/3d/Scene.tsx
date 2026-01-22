import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Sky, Cloud } from '@react-three/drei';
import { Suspense } from 'react';
import { Avatar } from './Avatar';
import { Island } from './Island';
import { GiftBox } from './GiftBox';
import { FelicidadesText } from './Text3D';
import { FollowCamera } from './FollowCamera';
import { useGameStore } from '../../stores/gameStore';
import type { MinigameId } from '../../types';

const GIFT_POSITIONS: { id: string; position: [number, number, number]; game: MinigameId }[] = [
  { id: 'gift1', position: [-3, 0.5, -3], game: 'scratch' },
  { id: 'gift2', position: [3, 0.5, -3], game: 'trivia' },
  { id: 'gift3', position: [-3, 0.5, 3], game: 'balloons' },
  { id: 'gift4', position: [3, 0.5, 3], game: 'flowers' },
];

export function Scene() {
  const isGameCompleted = useGameStore((s) => s.isGameCompleted);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      style={{ touchAction: 'none' }}
      gl={{ antialias: true, alpha: false }}
    >
      {/* Perspective Camera for 3D depth - Mario style */}
      <PerspectiveCamera
        makeDefault
        fov={60}
        near={0.1}
        far={1000}
        position={[0, 8, 12]}
      />

      {/* Camera that follows the player */}
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

      {/* Hemisphere light for natural outdoor feel */}
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

        {/* Gift Boxes */}
        {GIFT_POSITIONS.map((gift) => (
          <GiftBox
            key={gift.id}
            position={gift.position}
            gameId={gift.game!}
            isCompleted={isGameCompleted(gift.game!)}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}
