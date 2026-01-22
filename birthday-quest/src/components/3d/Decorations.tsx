import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Cute 3D Panda that wanders around
export function Panda({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef({ x: position[0], z: position[2] });
  const currentPos = useRef({ x: position[0], z: position[2] });
  const wanderTimer = useRef(Math.random() * 5);
  const baseY = position[1];

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Wander logic - pick new target every few seconds
    wanderTimer.current -= delta;
    if (wanderTimer.current <= 0) {
      // Pick new random target within range of original position
      const range = 3;
      targetPos.current.x = position[0] + (Math.random() - 0.5) * range * 2;
      targetPos.current.z = position[2] + (Math.random() - 0.5) * range * 2;
      wanderTimer.current = 3 + Math.random() * 4; // 3-7 seconds between moves
    }

    // Move towards target
    const dx = targetPos.current.x - currentPos.current.x;
    const dz = targetPos.current.z - currentPos.current.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 0.1) {
      const speed = 0.5 * delta;
      currentPos.current.x += (dx / distance) * speed;
      currentPos.current.z += (dz / distance) * speed;

      // Face movement direction
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }

    // Apply position with bobbing
    groupRef.current.position.x = currentPos.current.x;
    groupRef.current.position.z = currentPos.current.z;
    groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 4) * 0.05;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Ears - black */}
      <mesh position={[-0.2, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.2, 1.0, 0]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Eye patches - black */}
      <mesh position={[-0.12, 0.8, 0.22]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.12, 0.8, 0.22]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Eyes - white dots */}
      <mesh position={[-0.1, 0.82, 0.28]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0.14, 0.82, 0.28]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0.7, 0.28]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Arms - black */}
      <mesh position={[-0.35, 0.35, 0]} rotation={[0, 0, 0.5]} castShadow>
        <capsuleGeometry args={[0.1, 0.2, 8, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.35, 0.35, 0]} rotation={[0, 0, -0.5]} castShadow>
        <capsuleGeometry args={[0.1, 0.2, 8, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Legs - black */}
      <mesh position={[-0.15, 0.05, 0.1]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.15, 0.05, 0.1]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Blush */}
      <mesh position={[-0.18, 0.72, 0.25]}>
        <circleGeometry args={[0.04, 12]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.18, 0.72, 0.25]}>
        <circleGeometry args={[0.04, 12]} />
        <meshStandardMaterial color="#FFB6C1" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Cute 3D Cat that wanders around
export function Cat({ position, scale = 1, color = '#FF9F5A' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef({ x: position[0], z: position[2] });
  const currentPos = useRef({ x: position[0], z: position[2] });
  const wanderTimer = useRef(Math.random() * 3);
  const isResting = useRef(false);
  const restTimer = useRef(0);
  const baseY = position[1];

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Cats rest sometimes
    if (isResting.current) {
      restTimer.current -= delta;
      if (restTimer.current <= 0) {
        isResting.current = false;
      }
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 1) * 0.02;
      return;
    }

    // Wander logic
    wanderTimer.current -= delta;
    if (wanderTimer.current <= 0) {
      // 30% chance to rest
      if (Math.random() < 0.3) {
        isResting.current = true;
        restTimer.current = 2 + Math.random() * 3;
        wanderTimer.current = 2;
        return;
      }

      // Pick new random target
      const range = 4;
      targetPos.current.x = position[0] + (Math.random() - 0.5) * range * 2;
      targetPos.current.z = position[2] + (Math.random() - 0.5) * range * 2;
      wanderTimer.current = 2 + Math.random() * 3;
    }

    // Move towards target (cats are faster than pandas)
    const dx = targetPos.current.x - currentPos.current.x;
    const dz = targetPos.current.z - currentPos.current.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance > 0.1) {
      const speed = 0.8 * delta;
      currentPos.current.x += (dx / distance) * speed;
      currentPos.current.z += (dz / distance) * speed;
      groupRef.current.rotation.y = Math.atan2(dx, dz);
    }

    groupRef.current.position.x = currentPos.current.x;
    groupRef.current.position.z = currentPos.current.z;
    groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 3) * 0.03;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.15, 0.25, 8, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Head */}
      <mesh position={[0.25, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Ears */}
      <mesh position={[0.32, 0.48, -0.08]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.06, 0.12, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.32, 0.48, 0.08]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.06, 0.12, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Inner ears - pink */}
      <mesh position={[0.33, 0.46, -0.08]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.03, 0.08, 4]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>
      <mesh position={[0.33, 0.46, 0.08]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.03, 0.08, 4]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.38, 0.32, -0.06]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.38, 0.32, 0.06]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Nose */}
      <mesh position={[0.42, 0.26, 0]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>

      {/* Tail */}
      <mesh position={[-0.35, 0.25, 0]} rotation={[0, 0, 0.8]} castShadow>
        <capsuleGeometry args={[0.04, 0.25, 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Legs */}
      <mesh position={[0.1, 0.08, 0.1]} castShadow>
        <capsuleGeometry args={[0.04, 0.1, 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 0.08, -0.1]} castShadow>
        <capsuleGeometry args={[0.04, 0.1, 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.15, 0.08, 0.1]} castShadow>
        <capsuleGeometry args={[0.04, 0.1, 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.15, 0.08, -0.1]} castShadow>
        <capsuleGeometry args={[0.04, 0.1, 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Beautiful 3D Rose
export function Rose({ position, scale = 1, color = '#E84A5F' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Stem */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.025, 0.5, 8]} />
        <meshStandardMaterial color="#2D5A27" />
      </mesh>

      {/* Leaves */}
      <mesh position={[0.08, 0.2, 0]} rotation={[0, 0, -0.5]}>
        <sphereGeometry args={[0.06, 8, 8, 0, Math.PI]} />
        <meshStandardMaterial color="#3D7A37" />
      </mesh>
      <mesh position={[-0.08, 0.3, 0]} rotation={[0, 0, 0.5]}>
        <sphereGeometry args={[0.05, 8, 8, 0, Math.PI]} />
        <meshStandardMaterial color="#3D7A37" />
      </mesh>

      {/* Rose bloom - layered petals */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.08, 0.52, Math.sin(angle) * 0.08]}
            rotation={[0.3, angle, 0]}
          >
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
      {/* Inner petals */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + 0.4;
        return (
          <mesh
            key={`inner-${i}`}
            position={[Math.cos(angle) * 0.04, 0.58, Math.sin(angle) * 0.04]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
}

// Olive (Aceituna)
export function Olive({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Olive body */}
      <mesh castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#556B2F" />
      </mesh>
      {/* Pimiento inside */}
      <mesh position={[0.05, 0.02, 0]}>
        <cylinderGeometry args={[0.025, 0.02, 0.08, 8]} />
        <meshStandardMaterial color="#C41E3A" />
      </mesh>
    </group>
  );
}

// Arrow indicator for path
export function PathArrow({
  position,
  rotation = 0,
  color = '#E8C87D'
}: {
  position: [number, number, number];
  rotation?: number;
  color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Pulsing glow effect
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse * 0.5;
    }
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Arrow body */}
      <mesh ref={meshRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.3, 3]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Glow ring */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.18, 16]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.4}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

// Heart decoration
export function Heart({ position, scale = 1, color = '#E84A5F' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Beating animation
      const beat = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.1;
      groupRef.current.scale.setScalar(scale * beat);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Heart made of two spheres + cone */}
      <mesh position={[-0.06, 0.05, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.06, 0.05, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.05, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.11, 0.15, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Floating sparkle
export function Sparkle({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      const scale = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.08, 0]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}
