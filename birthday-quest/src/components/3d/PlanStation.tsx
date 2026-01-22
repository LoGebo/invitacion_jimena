import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import type { PlanActivity } from '../../data/datePlan';

// Carl's Jr 3D Station Component
function CarlsJrStation({ activity, onApproach, index }: { activity: PlanActivity; onApproach?: (activity: PlanActivity) => void; index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const wasNear = useRef(false);
  const { scene } = useGLTF('/models/carls_jr.glb');

  useFrame((state) => {
    if (!groupRef.current) return;

    const [px, , pz] = useGameStore.getState().avatarActualPosition;
    const [sx, , sz] = activity.position;
    const distance = Math.sqrt((px - sx) ** 2 + (pz - sz) ** 2);
    const near = distance < 3;

    if (near && !wasNear.current && onApproach) {
      onApproach(activity);
    }
    wasNear.current = near;

    // Gentle floating
    groupRef.current.position.y = activity.position[1] + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.05;
  });

  return (
    <group ref={groupRef} position={activity.position}>
      {/* Decorative base with gradient rings */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#F59E0B" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.5, 32]} />
        <meshStandardMaterial color="#F97316" emissive="#F97316" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.2, 32]} />
        <meshStandardMaterial color="#FFFBF7" transparent opacity={0.5} />
      </mesh>

      {/* Main platform */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.0, 1.1, 0.15, 24]} />
        <meshStandardMaterial color="#F59E0B" />
      </mesh>

      {/* Platform top decoration */}
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.02, 24]} />
        <meshStandardMaterial color="#FFFBF7" />
      </mesh>

      {/* Ornate post */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1.6, 12]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>

      {/* Post decorative rings */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.14, 0.035, 8, 16]} />
        <meshStandardMaterial color="#E8C87D" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 16]} />
        <meshStandardMaterial color="#E8C87D" />
      </mesh>

      {/* Carl's Jr 3D Model - on top of post */}
      <Clone
        object={scene}
        scale={1.2}
        position={[-1.3, 3.0, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Glow light */}
      <pointLight position={[0, 3.0, 0]} intensity={2} distance={5} color="#F59E0B" />
    </group>
  );
}

useGLTF.preload('/models/carls_jr.glb');

// Netflix 3D Station Component
function NetflixStation({ activity, onApproach, index }: { activity: PlanActivity; onApproach?: (activity: PlanActivity) => void; index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const wasNear = useRef(false);
  const { scene } = useGLTF('/models/netflix.glb');

  useFrame((state) => {
    if (!groupRef.current) return;

    const [px, , pz] = useGameStore.getState().avatarActualPosition;
    const [sx, , sz] = activity.position;
    const distance = Math.sqrt((px - sx) ** 2 + (pz - sz) ** 2);
    const near = distance < 3;

    if (near && !wasNear.current && onApproach) {
      onApproach(activity);
    }
    wasNear.current = near;

    // Gentle floating
    groupRef.current.position.y = activity.position[1] + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.05;
  });

  return (
    <group ref={groupRef} position={activity.position}>
      {/* Decorative base with gradient rings - red for Netflix */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#E50914" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.5, 32]} />
        <meshStandardMaterial color="#B81D24" emissive="#E50914" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.2, 32]} />
        <meshStandardMaterial color="#FFFBF7" transparent opacity={0.5} />
      </mesh>

      {/* Main platform */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.0, 1.1, 0.15, 24]} />
        <meshStandardMaterial color="#E50914" />
      </mesh>

      {/* Platform top decoration */}
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.95, 0.95, 0.02, 24]} />
        <meshStandardMaterial color="#FFFBF7" />
      </mesh>

      {/* Ornate post */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 1.6, 12]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>

      {/* Post decorative rings */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.14, 0.035, 8, 16]} />
        <meshStandardMaterial color="#E8C87D" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 16]} />
        <meshStandardMaterial color="#E8C87D" />
      </mesh>

      {/* Netflix 3D Model - on top of post */}
      <Clone
        object={scene}
        scale={5}
        position={[0, 2.2, 0]}
        rotation={[0, 0, 0]}
      />

      {/* Glow light - red */}
      <pointLight position={[0, 3.0, 0]} intensity={2} distance={5} color="#E50914" />
    </group>
  );
}

useGLTF.preload('/models/netflix.glb');

interface PlanStationProps {
  activity: PlanActivity;
  index: number;
  onApproach?: (activity: PlanActivity) => void;
}

export function PlanStation({ activity, index, onApproach }: PlanStationProps) {
  // Use special Carl's Jr component for food station
  if (activity.id === 'food') {
    return <CarlsJrStation activity={activity} onApproach={onApproach} index={index} />;
  }

  // Use special Netflix component for movie station
  if (activity.id === 'movie') {
    return <NetflixStation activity={activity} onApproach={onApproach} index={index} />;
  }

  return <DefaultStation activity={activity} index={index} onApproach={onApproach} />;
}

// Default station component for non-special stations
function DefaultStation({ activity, index, onApproach }: PlanStationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wasNear = useRef(false);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const [px, , pz] = useGameStore.getState().avatarActualPosition;
    const [sx, , sz] = activity.position;
    const distance = Math.sqrt((px - sx) ** 2 + (pz - sz) ** 2);
    const near = distance < 2.5;

    if (near && !wasNear.current && onApproach) {
      onApproach(activity);
    }
    wasNear.current = near;

    groupRef.current.position.y = activity.position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1;

    if (glowRef.current) {
      const intensity = near ? 3 : 1;
      glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, intensity, 0.1);
    }
  });

  return (
    <group ref={groupRef} position={activity.position}>
      {/* Decorative base with gradient rings */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.3, 32]} />
        <meshStandardMaterial color={activity.color} transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.3, 32]} />
        <meshStandardMaterial
          color={activity.color}
          emissive={activity.color}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.0, 32]} />
        <meshStandardMaterial color="#FFFBF7" transparent opacity={0.5} />
      </mesh>

      {/* Main platform */}
      <mesh position={[0, 0.12, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.9, 1.0, 0.15, 24]} />
        <meshStandardMaterial color={activity.color} />
      </mesh>

      {/* Platform top decoration */}
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.02, 24]} />
        <meshStandardMaterial color="#FFFBF7" />
      </mesh>

      {/* Ornate post */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.4, 12]} />
        <meshStandardMaterial color="#D4A574" />
      </mesh>
      {/* Post decorative rings */}
      <mesh position={[0, 0.4, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 16]} />
        <meshStandardMaterial color="#E8C87D" />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <torusGeometry args={[0.1, 0.025, 8, 16]} />
        <meshStandardMaterial color="#E8C87D" />
      </mesh>

      {/* Beautiful sign board with frame */}
      <group position={[0, 2.35, 0]}>
        {/* Back frame */}
        <mesh position={[0, 0, -0.08]} castShadow>
          <boxGeometry args={[1.8, 1.2, 0.08]} />
          <meshStandardMaterial color="#A67C52" />
        </mesh>
        {/* Main board */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.6, 1.0, 0.12]} />
          <meshStandardMaterial color={activity.color} />
        </mesh>
        {/* Inner lighter area */}
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[1.4, 0.8, 0.02]} />
          <meshStandardMaterial color="#FFFBF7" transparent opacity={0.3} />
        </mesh>

        {/* Decorative corners */}
        {[[-0.7, 0.4], [0.7, 0.4], [-0.7, -0.4], [0.7, -0.4]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.08]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#E8C87D" />
          </mesh>
        ))}

        {/* Number badge */}
        <group position={[-0.55, 0.25, 0.1]}>
          <mesh>
            <circleGeometry args={[0.18, 16]} />
            <meshStandardMaterial color="#FFFBF7" />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <circleGeometry args={[0.14, 16]} />
            <meshStandardMaterial color={activity.color} />
          </mesh>
        </group>

        {/* Activity icon area */}
        <mesh position={[0.25, 0.15, 0.1]}>
          <circleGeometry args={[0.25, 16]} />
          <meshStandardMaterial
            color={activity.color}
            emissive={activity.color}
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Time indicator bar */}
        <mesh position={[0, -0.25, 0.1]}>
          <boxGeometry args={[1.0, 0.18, 0.02]} />
          <meshStandardMaterial color="#FFFBF7" />
        </mesh>
      </group>

      {/* Floating light orbs around station */}
      {[0, 1, 2].map((i) => {
        const angle = (i / 3) * Math.PI * 2;
        return (
          <FloatingOrb
            key={i}
            basePosition={[Math.cos(angle) * 1.2, 2.0, Math.sin(angle) * 1.2]}
            color={activity.color}
            delay={i * 0.5}
          />
        );
      })}

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        position={[0, 2.5, 0.5]}
        intensity={1}
        distance={4}
        color={activity.color}
      />
    </group>
  );
}

// Floating orb component
function FloatingOrb({
  basePosition,
  color,
  delay
}: {
  basePosition: [number, number, number];
  color: string;
  delay: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime + delay;
      meshRef.current.position.y = basePosition[1] + Math.sin(t * 2) * 0.2;
      const scale = 0.08 + Math.sin(t * 3) * 0.02;
      meshRef.current.scale.setScalar(scale * 10);
    }
  });

  return (
    <mesh ref={meshRef} position={basePosition}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// Beautiful arrow path connecting stations
export function PlanPath({ positions }: { positions: [number, number, number][] }) {
  return (
    <group>
      {positions.map((pos, i) => {
        if (i === positions.length - 1) return null;
        const next = positions[i + 1];

        // Calculate direction and distance
        const dx = next[0] - pos[0];
        const dz = next[2] - pos[2];
        const distance = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);

        // Create arrows along the path
        const numArrows = Math.floor(distance / 0.8);
        const arrows = [];

        for (let j = 1; j <= numArrows; j++) {
          const t = j / (numArrows + 1);
          const x = pos[0] + dx * t;
          const z = pos[2] + dz * t;

          arrows.push(
            <ArrowMarker
              key={`${i}-${j}`}
              position={[x, 0.1, z]}
              rotation={angle}
              delay={j * 0.2 + i}
            />
          );
        }

        return arrows;
      })}
    </group>
  );
}

// Individual arrow marker with animation
function ArrowMarker({
  position,
  rotation,
  delay
}: {
  position: [number, number, number];
  rotation: number;
  delay: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime + delay;
      // Pulsing scale
      const pulse = 0.9 + Math.sin(t * 4) * 0.1;
      groupRef.current.scale.setScalar(pulse);
      // Subtle bounce
      groupRef.current.position.y = position[1] + Math.sin(t * 3) * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Arrow shape */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.25, 3]} />
        <meshStandardMaterial
          color="#E8C87D"
          emissive="#E8C87D"
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Glow base */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 12]} />
        <meshStandardMaterial
          color="#E8C87D"
          transparent
          opacity={0.3}
          emissive="#E8C87D"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}
