import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useGameStore } from '../../stores/gameStore';
import type { MinigameId } from '../../types';

interface GiftBoxProps {
  position: [number, number, number];
  gameId: string;
  isCompleted: boolean;
}

// Cottagecore Pastel Colors for each gift
const GIFT_COLORS: Record<string, { box: string; ribbon: string }> = {
  scratch: {
    box: '#F8E1E7',      // Dusty pink
    ribbon: '#E8C87D',   // Honey gold
  },
  trivia: {
    box: '#E8E0F0',      // Lavender
    ribbon: '#FFECD2',   // Cream
  },
  balloons: {
    box: '#FFECD2',      // Peach
    ribbon: '#D4A5A5',   // Dusty rose
  },
  flowers: {
    box: '#D4E2D4',      // Sage green
    ribbon: '#D4A574',   // Terracotta
  },
};

export function GiftBox({ position, gameId, isCompleted }: GiftBoxProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [isNear, setIsNear] = useState(false);

  const avatarPosition = useGameStore((s) => s.avatarActualPosition);
  const setCurrentMinigame = useGameStore((s) => s.setCurrentMinigame);
  const setPhase = useGameStore((s) => s.setPhase);

  // Detect avatar proximity
  useFrame((state) => {
    const distance = new THREE.Vector3(...avatarPosition).distanceTo(
      new THREE.Vector3(...position)
    );

    setIsNear(distance < 1.8 && !isCompleted);

    // Floating + gentle rotation animation
    if (meshRef.current && !isCompleted) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      meshRef.current.rotation.y += 0.003;
    }
  });

  const handleOpen = () => {
    setCurrentMinigame(gameId as MinigameId);
    setPhase('minigame');
  };

  const colors = GIFT_COLORS[gameId] || GIFT_COLORS.scratch;

  return (
    <group position={position}>
      <group ref={meshRef}>
        {/* === MAIN BOX === */}
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial
            color={isCompleted ? '#C9B99A' : colors.box}
            opacity={isCompleted ? 0.6 : 1}
            transparent
          />
        </mesh>

        {/* Rounded bottom border (simulates soft corners) */}
        <mesh position={[0, -0.32, 0]}>
          <torusGeometry args={[0.35, 0.05, 8, 4, Math.PI * 2]} />
          <meshStandardMaterial color={isCompleted ? '#A8A8A8' : colors.ribbon} />
        </mesh>

        {/* === DECORATIVE BOW/RIBBON === */}
        {!isCompleted && (
          <group position={[0, 0.4, 0]}>
            {/* Horizontal ribbon */}
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[0.15, 0.04, 8, 16]} />
              <meshStandardMaterial color={colors.ribbon} />
            </mesh>
            {/* Vertical ribbon */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.15, 0.04, 8, 16]} />
              <meshStandardMaterial color={colors.ribbon} />
            </mesh>
            {/* Bow center */}
            <mesh position={[0, 0.02, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color={colors.ribbon} />
            </mesh>
            {/* Ribbon strips down */}
            <mesh position={[0, -0.2, 0.36]}>
              <boxGeometry args={[0.08, 0.4, 0.02]} />
              <meshStandardMaterial color={colors.ribbon} />
            </mesh>
            <mesh position={[0, -0.2, -0.36]}>
              <boxGeometry args={[0.08, 0.4, 0.02]} />
              <meshStandardMaterial color={colors.ribbon} />
            </mesh>
            <mesh position={[0.36, -0.2, 0]}>
              <boxGeometry args={[0.02, 0.4, 0.08]} />
              <meshStandardMaterial color={colors.ribbon} />
            </mesh>
            <mesh position={[-0.36, -0.2, 0]}>
              <boxGeometry args={[0.02, 0.4, 0.08]} />
              <meshStandardMaterial color={colors.ribbon} />
            </mesh>
          </group>
        )}

        {/* Decorative flowers on corners (if not completed) */}
        {!isCompleted && (
          <>
            <mesh position={[0.3, 0.35, 0.3]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#F8E1E7" />
            </mesh>
            <mesh position={[-0.3, 0.35, -0.3]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#E8E0F0" />
            </mesh>
          </>
        )}
      </group>

      {/* Floral checkmark if completed */}
      {isCompleted && (
        <Html center>
          <div className="text-4xl opacity-80">🌸</div>
        </Html>
      )}

      {/* OPEN Button - cottagecore style */}
      {isNear && (
        <Html center position={[0, 1.3, 0]}>
          <button
            onClick={handleOpen}
            className="px-5 py-2.5 text-petal-white font-comfortaa font-bold rounded-full shadow-lg border-2 border-petal-white/50 animate-bounce text-lg whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #D4A5A5, #E8C87D)',
              boxShadow: '0 4px 15px rgba(212, 165, 165, 0.4)',
            }}
          >
            Abrir 🌷
          </button>
        </Html>
      )}
    </group>
  );
}
