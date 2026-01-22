import { useRef } from 'react';
import { Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Text3DProps {
  text: string;
  position?: [number, number, number];
  color?: string;
  fontSize?: number;
  floating?: boolean;
}

export function Text3DTitle({
  text,
  position = [0, 3, 0],
  color = '#D4A574',
  fontSize = 0.8,
  floating = true
}: Text3DProps) {
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (textRef.current && !floating) {
      // Gentle rotation when not using Float
      textRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const content = (
    <Text
      ref={textRef}
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      font="/fonts/Comfortaa-Bold.ttf"
      letterSpacing={0.05}
      outlineWidth={0.02}
      outlineColor="#FFFBF7"
    >
      {text}
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.4}
      />
    </Text>
  );

  if (floating) {
    return (
      <Float
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={0.5}
        floatingRange={[-0.1, 0.1]}
      >
        {content}
      </Float>
    );
  }

  return content;
}

// Multi-line 3D title for "Felicidades Jimena"
export function FelicidadesText() {
  return (
    <group position={[0, 4.5, -2]}>
      {/* Main title - Felicidades */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <Text
          position={[0, 1.0, 0]}
          fontSize={0.75}
          color="#E8C87D"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
          outlineWidth={0.025}
          outlineColor="#FFFBF7"
        >
          FELICIDADES
          <meshStandardMaterial
            color="#E8C87D"
            metalness={0.4}
            roughness={0.3}
            emissive="#E8C87D"
            emissiveIntensity={0.2}
          />
        </Text>
      </Float>

      {/* Subtitle - (adelantadas xd) */}
      <Float speed={1.6} rotationIntensity={0.08} floatIntensity={0.25}>
        <Text
          position={[0, 0.35, 0]}
          fontSize={0.3}
          color="#D4A5A5"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
          outlineWidth={0.015}
          outlineColor="#FFFBF7"
        >
          (adelantadas xd)
          <meshStandardMaterial
            color="#D4A5A5"
            metalness={0.3}
            roughness={0.4}
            emissive="#D4A5A5"
            emissiveIntensity={0.15}
          />
        </Text>
      </Float>

      {/* Name - Jimena */}
      <Float speed={1.8} rotationIntensity={0.15} floatIntensity={0.4}>
        <Text
          position={[0, -0.5, 0]}
          fontSize={1.1}
          color="#5B9BD5"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
          outlineWidth={0.03}
          outlineColor="#FFFBF7"
        >
          JIMENA
          <meshStandardMaterial
            color="#5B9BD5"
            metalness={0.5}
            roughness={0.2}
            emissive="#5B9BD5"
            emissiveIntensity={0.3}
          />
        </Text>
      </Float>

      {/* Decorative elements - Flowers and Hearts */}
      <Float speed={2} floatIntensity={0.6}>
        <Text position={[-3, 0.5, 0]} fontSize={0.5} color="#F8E1E7">
          ✿
        </Text>
      </Float>
      <Float speed={2.2} floatIntensity={0.5}>
        <Text position={[3, 0.5, 0]} fontSize={0.5} color="#F8E1E7">
          ✿
        </Text>
      </Float>
      <Float speed={1.8} floatIntensity={0.7}>
        <Text position={[0, 1.8, 0]} fontSize={0.45} color="#D4A5A5">
          ♥
        </Text>
      </Float>
      <Float speed={2.5} floatIntensity={0.5}>
        <Text position={[-2, -0.5, 0]} fontSize={0.35} color="#A8C69F">
          🌸
        </Text>
      </Float>
      <Float speed={2.3} floatIntensity={0.5}>
        <Text position={[2, -0.5, 0]} fontSize={0.35} color="#A8C69F">
          🌸
        </Text>
      </Float>
      {/* Panda easter egg */}
      <Float speed={1.5} floatIntensity={0.8}>
        <Text position={[0, -1.5, 0]} fontSize={0.4} color="#1a1a1a">
          🐼
        </Text>
      </Float>
    </group>
  );
}
