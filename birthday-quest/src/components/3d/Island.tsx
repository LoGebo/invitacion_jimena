import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Cottagecore Colors
const COLORS = {
  grass: '#D4E2D4',       // Sage green soft
  grassDark: '#A8C69F',   // Moss green
  grassLight: '#E8F0E8',  // Light grass
  stone: '#C9B99A',       // Soft brown stone
  stoneDark: '#B5A88A',   // Darker stone
  wood: '#D4A574',        // Terracotta wood
  woodDark: '#C49464',    // Darker wood
  flower1: '#F8E1E7',     // Pink dusty
  flower2: '#FFECD2',     // Peach
  flower3: '#E8E0F0',     // Lavender
  flower4: '#E8C87D',     // Honey yellow
  flower5: '#5B9BD5',     // Blue XV
  mushroom: '#F8E1E7',    // Pink mushroom
  mushroomSpot: '#FFFBF7', // White spots
  water: '#87CEEB',       // Sky blue water
  waterDeep: '#5B9BD5',   // Deeper water
};

// Animated butterfly
function Butterfly({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  const initialPos = useRef(position);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed;
      ref.current.position.x = initialPos.current[0] + Math.sin(t * 0.7) * 1.5;
      ref.current.position.y = initialPos.current[1] + Math.sin(t * 1.2) * 0.3;
      ref.current.position.z = initialPos.current[2] + Math.cos(t * 0.5) * 1.5;
      ref.current.rotation.y = Math.sin(t) * 0.5;
      // Wing flap
      ref.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.z = Math.sin(t * 8) * 0.5 * (i === 0 ? 1 : -1);
        }
      });
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Wings */}
      <mesh position={[-0.08, 0, 0]} rotation={[0, 0, 0.3]}>
        <planeGeometry args={[0.2, 0.15]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.08, 0, 0]} rotation={[0, 0, -0.3]}>
        <planeGeometry args={[0.2, 0.15]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.02, 0.08, 4, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

// Small flower component
function TinyFlower({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.05;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 6]} />
        <meshStandardMaterial color={COLORS.grassDark} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

// Cottagecore mushroom component
function Mushroom({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.15, 8]} />
        <meshStandardMaterial color="#FFFBF7" />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.1, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={COLORS.mushroom} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos(i * 2) * 0.06, 0.22, Math.sin(i * 2) * 0.06]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color={COLORS.mushroomSpot} />
        </mesh>
      ))}
    </group>
  );
}

// Cottagecore tree
function CottageTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const treeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.02;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.5, 8, 12]} />
        <meshStandardMaterial color={COLORS.wood} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={COLORS.grassDark} />
      </mesh>
      <mesh position={[-0.25, 0.9, 0.1]} castShadow>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshStandardMaterial color={COLORS.grass} />
      </mesh>
      <mesh position={[0.2, 0.95, -0.1]} castShadow>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color={COLORS.grassDark} />
      </mesh>
      {[[-0.3, 1.2, 0.3], [0.35, 1.0, 0.2], [0, 1.4, -0.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? COLORS.flower1 : COLORS.flower4} />
        </mesh>
      ))}
    </group>
  );
}

// Wooden fence
function WoodenFence({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[-0.3, 0, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0]} castShadow>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshStandardMaterial color={COLORS.wood} />
        </mesh>
      ))}
      {[0.1, 0.25].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <boxGeometry args={[0.7, 0.05, 0.03]} />
          <meshStandardMaterial color={COLORS.wood} />
        </mesh>
      ))}
    </group>
  );
}

// Cute Cat decoration
function CatDecoration({ position, color = '#FF9F5A' }: { position: [number, number, number]; color?: string }) {
  const catRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (catRef.current) {
      // Tail wag
      catRef.current.children[4].rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.3;
      // Gentle idle animation
      catRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
  });

  return (
    <group ref={catRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.15, 0]}>
        <capsuleGeometry args={[0.12, 0.2, 8, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh position={[0.15, 0.25, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Ears */}
      <mesh position={[0.18, 0.38, -0.06]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.04, 0.08, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.18, 0.38, 0.06]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.04, 0.08, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.18, 0.2, 0]} rotation={[0, 0, -0.5]}>
        <capsuleGeometry args={[0.025, 0.2, 6, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.24, 0.28, -0.04]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.24, 0.28, 0.04]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Nose */}
      <mesh position={[0.27, 0.24, 0]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>
    </group>
  );
}

// Cute Goat (Chiva) decoration
function GoatDecoration({ position }: { position: [number, number, number] }) {
  const goatRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (goatRef.current) {
      // Head bob like eating grass
      goatRef.current.children[1].rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1 - 0.2;
    }
  });

  return (
    <group ref={goatRef} position={position}>
      {/* Body */}
      <mesh position={[0, 0.25, 0]}>
        <capsuleGeometry args={[0.15, 0.3, 8, 12]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
      {/* Head */}
      <group position={[0.25, 0.35, 0]}>
        <mesh>
          <boxGeometry args={[0.15, 0.12, 0.1]} />
          <meshStandardMaterial color="#F5F5DC" />
        </mesh>
        {/* Horns */}
        <mesh position={[0, 0.1, -0.03]} rotation={[0.3, 0, -0.2]}>
          <coneGeometry args={[0.02, 0.12, 6]} />
          <meshStandardMaterial color="#D4A574" />
        </mesh>
        <mesh position={[0, 0.1, 0.03]} rotation={[-0.3, 0, -0.2]}>
          <coneGeometry args={[0.02, 0.12, 6]} />
          <meshStandardMaterial color="#D4A574" />
        </mesh>
        {/* Beard */}
        <mesh position={[0.08, -0.05, 0]}>
          <coneGeometry args={[0.02, 0.06, 4]} />
          <meshStandardMaterial color="#E8E8E8" />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.05, 0.02, -0.04]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.05, 0.02, 0.04]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
      {/* Legs */}
      {[[-0.1, 0, -0.08], [-0.1, 0, 0.08], [0.1, 0, -0.08], [0.1, 0, 0.08]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.025, 0.025, 0.25, 6]} />
          <meshStandardMaterial color="#F5F5DC" />
        </mesh>
      ))}
      {/* Tail */}
      <mesh position={[-0.2, 0.3, 0]} rotation={[0, 0, -0.8]}>
        <coneGeometry args={[0.03, 0.08, 4]} />
        <meshStandardMaterial color="#F5F5DC" />
      </mesh>
    </group>
  );
}

// Olive decoration
function OliveDecoration({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Olive */}
      <mesh>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#556B2F" />
      </mesh>
      {/* Pimiento inside */}
      <mesh position={[0.04, 0.02, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.04, 6]} />
        <meshStandardMaterial color="#FF4500" />
      </mesh>
    </group>
  );
}

// Christmas Tree with lights
function ChristmasTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const treeRef = useRef<THREE.Group>(null);
  const lightsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lightsRef.current) {
      // Twinkling lights effect
      lightsRef.current.children.forEach((light, i) => {
        const mesh = light as THREE.Mesh;
        const t = state.clock.elapsedTime * 3 + i * 0.5;
        const intensity = 0.5 + Math.sin(t) * 0.5;
        if (mesh.material instanceof THREE.MeshStandardMaterial) {
          mesh.material.emissiveIntensity = intensity;
        }
      });
    }
  });

  const lightColors = ['#FF0000', '#FFD700', '#00FF00', '#0080FF', '#FF69B4', '#FFA500'];
  const lightPositions: [number, number, number][] = [
    // Bottom tier
    [0.5, 0.4, 0], [-0.5, 0.5, 0], [0, 0.45, 0.5], [0, 0.4, -0.5],
    [0.35, 0.42, 0.35], [-0.35, 0.48, 0.35], [0.35, 0.46, -0.35], [-0.35, 0.44, -0.35],
    // Middle tier
    [0.35, 0.9, 0], [-0.35, 0.95, 0], [0, 0.88, 0.35], [0, 0.92, -0.35],
    [0.25, 0.9, 0.25], [-0.25, 0.93, 0.25],
    // Top tier
    [0.2, 1.35, 0], [-0.2, 1.38, 0], [0, 1.32, 0.2], [0, 1.36, -0.2],
  ];

  return (
    <group ref={treeRef} position={position} scale={scale}>
      {/* Tree trunk */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Tree layers (cones) - nice forest green */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <coneGeometry args={[0.7, 0.8, 12]} />
        <meshStandardMaterial color="#2D5A2D" />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <coneGeometry args={[0.55, 0.7, 12]} />
        <meshStandardMaterial color="#336B33" />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <coneGeometry args={[0.4, 0.6, 12]} />
        <meshStandardMaterial color="#3D7A3D" />
      </mesh>

      {/* Star on top */}
      <group position={[0, 1.85, 0]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
        </mesh>
        <pointLight position={[0, 0.1, 0]} intensity={1} distance={2} color="#FFD700" />
      </group>

      {/* Christmas lights */}
      <group ref={lightsRef}>
        {lightPositions.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial
              color={lightColors[i % lightColors.length]}
              emissive={lightColors[i % lightColors.length]}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Ornaments (baubles) */}
      <mesh position={[0.4, 0.5, 0.2]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial color="#FF0000" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.3, 0.7, 0.3]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.25, 1.0, -0.2]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#0080FF" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.2, 1.2, 0.15]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#FF69B4" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.15, 0.85, 0.25]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial color="#9400D3" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Glow light under tree */}
      <pointLight position={[0, 0.5, 0]} intensity={0.5} distance={3} color="#90EE90" />
    </group>
  );
}

// Number 9 Easter Egg
function Number9({ position, color = '#5B9BD5', scale = 1 }: { position: [number, number, number]; color?: string; scale?: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Circle of 9 */}
      <mesh position={[0, 0.12, 0]}>
        <torusGeometry args={[0.1, 0.035, 8, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Tail of 9 */}
      <mesh position={[0.1, -0.02, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.035, 0.15, 6, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

// Panda decoration
function PandaDecoration({ position }: { position: [number, number, number] }) {
  const pandaRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (pandaRef.current) {
      pandaRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      pandaRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });

  return (
    <group ref={pandaRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[-0.1, 0.38, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.1, 0.38, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.05, 0.28, 0.12]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.05, 0.28, 0.12]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.22, 0.14]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

// Wooden bench
function WoodenBench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Legs */}
      {[[-0.3, 0.15, 0], [0.3, 0.15, 0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.25]} />
          <meshStandardMaterial color={COLORS.woodDark} />
        </mesh>
      ))}
      {/* Seat */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.8, 0.06, 0.3]} />
        <meshStandardMaterial color={COLORS.wood} />
      </mesh>
      {/* Back rest */}
      <mesh position={[0, 0.5, -0.12]} castShadow>
        <boxGeometry args={[0.75, 0.3, 0.04]} />
        <meshStandardMaterial color={COLORS.wood} />
      </mesh>
    </group>
  );
}

// Small hill/mound
function Hill({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={[scale, scale * 0.4, scale]} receiveShadow>
      <sphereGeometry args={[1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color={COLORS.grass} />
    </mesh>
  );
}

// Wishing well
function WishingWell({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.45, 0.4, 12]} />
        <meshStandardMaterial color={COLORS.stone} />
      </mesh>
      {/* Inner dark */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 12]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Roof supports */}
      {[[0.25, 0.6, 0], [-0.25, 0.6, 0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.06, 0.8, 0.06]} />
          <meshStandardMaterial color={COLORS.wood} />
        </mesh>
      ))}
      {/* Roof */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <coneGeometry args={[0.5, 0.4, 6]} />
        <meshStandardMaterial color={COLORS.woodDark} />
      </mesh>
    </group>
  );
}

// Floating sparkles/particles
function Sparkles() {
  const particlesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const t = state.clock.elapsedTime + i;
        child.position.y = 1 + Math.sin(t * 0.5) * 0.5;
        const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (material.opacity !== undefined) material.opacity = 0.3 + Math.sin(t * 2) * 0.3;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 3 + (i % 3);
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color={COLORS.flower4}
              transparent
              opacity={0.5}
              emissive={COLORS.flower4}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function Island() {
  const flowerPositions = useRef(
    [...Array(50)].map((_, i) => {
      const seed = i * 1234;
      const angle = ((seed % 360) / 360) * Math.PI * 2;
      const radius = 2 + ((seed % 500) / 100);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return { x, z, colorIndex: i % 5 };
    })
  ).current;

  return (
    <group>
      {/* === MAIN PLATFORM === */}
      <mesh receiveShadow position={[0, -0.1, 0]}>
        <cylinderGeometry args={[8, 8.5, 0.3, 48]} />
        <meshStandardMaterial color={COLORS.grass} />
      </mesh>

      {/* === TERRAIN VARIATION - HILLS === */}
      <Hill position={[-5, 0, -4]} scale={1.5} />
      <Hill position={[5, 0, 4]} scale={1.2} />
      <Hill position={[4, 0, -5]} scale={1} />

      {/* === DECORATIVE STONE BORDER === */}
      {[...Array(24)].map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const x = Math.cos(angle) * 7.8;
        const z = Math.sin(angle) * 7.8;
        const scale = 0.8 + (i % 3) * 0.2;
        return (
          <mesh key={i} position={[x, 0, z]} scale={[scale, scale * 0.6, scale]}>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color={COLORS.stone} flatShading />
          </mesh>
        );
      })}

      {/* === DIRT PATHS === */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 14]} />
        <meshStandardMaterial color={COLORS.stone} opacity={0.4} transparent />
      </mesh>
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[1.2, 14]} />
        <meshStandardMaterial color={COLORS.stone} opacity={0.4} transparent />
      </mesh>


      {/* === WISHING WELL === */}
      <WishingWell position={[2, 0, -2]} />

      {/* === WOODEN BENCHES === */}
      <WoodenBench position={[-1, 0, -5]} rotation={0} />
      <WoodenBench position={[5, 0, 1]} rotation={Math.PI / 2} />

      {/* === COTTAGECORE TREES === */}
      <CottageTree position={[-5.5, 0, -5.5]} />
      <CottageTree position={[5.5, 0, -5.5]} scale={0.9} />
      <CottageTree position={[-5.5, 0, 5.5]} scale={1.1} />
      <CottageTree position={[5.5, 0, 5.5]} />
      <CottageTree position={[0, 0, -6.5]} scale={0.85} />
      <CottageTree position={[-6, 0, 0]} scale={0.75} />
      <CottageTree position={[6, 0, -2]} scale={0.8} />

      {/* === DISPERSED FLOWERS === */}
      {flowerPositions.map((pos, i) => {
        const colors = [COLORS.flower1, COLORS.flower2, COLORS.flower3, COLORS.flower4, COLORS.flower5];
        return (
          <TinyFlower
            key={i}
            position={[pos.x, 0, pos.z]}
            color={colors[pos.colorIndex]}
          />
        );
      })}

      {/* === DECORATIVE MUSHROOMS === */}
      <Mushroom position={[-2, 0, -2]} scale={0.8} />
      <Mushroom position={[3, 0, 1]} scale={1.2} />
      <Mushroom position={[-1, 0, 4]} scale={0.6} />
      <Mushroom position={[4, 0, -4]} scale={1} />
      <Mushroom position={[-4, 0, 3]} scale={0.9} />


      {/* === WOODEN FENCES === */}
      <WoodenFence position={[-6.5, 0, 0]} rotation={Math.PI / 2} />
      <WoodenFence position={[6.5, 0, 0]} rotation={Math.PI / 2} />
      <WoodenFence position={[0, 0, -6.5]} rotation={0} />
      <WoodenFence position={[-6, 0, -3]} rotation={Math.PI / 4} />
      <WoodenFence position={[6, 0, 3]} rotation={-Math.PI / 4} />

      {/* === PANDA DECORATIONS (Jimena's favorite) === */}
      <PandaDecoration position={[-4, 0.3, 0]} />
      <PandaDecoration position={[4, 0.3, -3]} />
      <PandaDecoration position={[0, 0.3, 5.5]} />

      {/* === ANIMATED BUTTERFLIES === */}
      <Butterfly position={[-2, 1.5, -1]} color={COLORS.flower1} speed={1} />
      <Butterfly position={[3, 2, 2]} color={COLORS.flower3} speed={0.8} />
      <Butterfly position={[-1, 1.8, 3]} color={COLORS.flower5} speed={1.2} />
      <Butterfly position={[4, 1.5, -2]} color={COLORS.flower4} speed={0.9} />

      {/* === FLOATING SPARKLES === */}
      <Sparkles />

      {/* === CUTE CATS === */}
      <CatDecoration position={[-4.5, 0, 4]} color="#FF9F5A" />
      <CatDecoration position={[5, 0, -1]} color="#8B7355" />
      <CatDecoration position={[-2, 0, -5.5]} color="#FFE4B5" />
      <CatDecoration position={[1.5, 0, 6]} color="#D2691E" />

      {/* === CUTE GOATS (CHIVAS) === */}
      <GoatDecoration position={[-5.5, 0, 2]} />
      <GoatDecoration position={[4.5, 0, 5]} />
      <GoatDecoration position={[0, 0, -5.8]} />

      {/* === OLIVES (ACEITUNAS) === */}
      <OliveDecoration position={[-3.5, 0.1, 1.5]} scale={1.2} />
      <OliveDecoration position={[2.5, 0.1, 4]} scale={1} />
      <OliveDecoration position={[-1.5, 0.1, -3]} scale={0.9} />
      <OliveDecoration position={[5.5, 0.1, 2]} scale={1.1} />
      <OliveDecoration position={[-4, 0.1, -4.5]} scale={1} />
      {/* Olive cluster */}
      <group position={[3.5, 0, -4.5]}>
        <OliveDecoration position={[0, 0.1, 0]} scale={1.2} />
        <OliveDecoration position={[0.15, 0.08, 0.1]} scale={0.9} />
        <OliveDecoration position={[-0.1, 0.12, 0.12]} scale={1} />
      </group>

      {/* === CHRISTMAS TREE === */}
      <ChristmasTree position={[5, 0, 3]} scale={1.5} />

      {/* === NUMBER 9 EASTER EGG === */}
      <Number9 position={[-5, 0.5, -5]} color="#5B9BD5" scale={2.5} />

      {/* === AGUACATE DECORATION (Jimena loves avocados) === */}
      <group position={[1, 0.15, 5]}>
        <mesh>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#568203" />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#87A96B" />
        </mesh>
      </group>
      {/* More avocados */}
      <group position={[-3, 0.15, 2.5]}>
        <mesh>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#568203" />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#87A96B" />
        </mesh>
      </group>
      <group position={[4.5, 0.12, -2.5]}>
        <mesh>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#568203" />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#87A96B" />
        </mesh>
      </group>
    </group>
  );
}
