import { useRef, memo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

export const Avatar = memo(function Avatar() {
  const groupRef = useRef<THREE.Group>(null);
  const modelRef = useRef<THREE.Group>(null);
  const walkCycle = useRef(0);
  const initialized = useRef(false);

  const { scene } = useGLTF('/models/oshawott.glb');

  // Initialize position from store on mount (to preserve position across phase changes)
  useEffect(() => {
    if (groupRef.current && !initialized.current) {
      const store = useGameStore.getState();
      const [ax, ay, az] = store.avatarActualPosition;
      // Only restore if we have a valid stored position (not at origin)
      if (ax !== 0 || az !== 0) {
        groupRef.current.position.set(ax, ay || 0.5, az);
        console.log('Avatar: Restored position from store', [ax, ay, az]);
      }
      initialized.current = true;
    }
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current || !modelRef.current) return;

    const store = useGameStore.getState();
    const [targetX, , targetZ] = store.avatarPosition;
    const currentPos = groupRef.current.position;

    // Calculate direction to target
    const dx = targetX - currentPos.x;
    const dz = targetZ - currentPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const isMoving = distance > 0.05;

    // Move towards target (slower speed)
    if (isMoving) {
      currentPos.x += dx * 0.012;
      currentPos.z += dz * 0.012;

      // Rotate model to face movement direction
      const targetAngle = Math.atan2(dx, dz);
      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        targetAngle,
        0.15
      );

      // Walking animation: bounce + tilt + waddle (simulates arms/legs)
      walkCycle.current += delta * 12;
      const bounce = Math.abs(Math.sin(walkCycle.current * 2)) * 0.08;
      const tilt = Math.sin(walkCycle.current) * 0.12;
      const lean = Math.sin(walkCycle.current * 2) * 0.05;
      currentPos.y = 0.5 + bounce;
      modelRef.current.rotation.z = tilt;
      modelRef.current.rotation.x = lean;
    } else {
      // Idle: gentle breathing
      walkCycle.current = 0;
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.03;
      currentPos.y = 0.5 + breathe;
      modelRef.current.rotation.z *= 0.9;
      modelRef.current.rotation.x *= 0.9;
    }

    // Keep above ground
    if (currentPos.y < 0.5) currentPos.y = 0.5;

    // Sync actual position to store for other components to use
    store.setAvatarActualPosition([currentPos.x, currentPos.y, currentPos.z]);
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <group ref={modelRef}>
        <Clone object={scene} scale={0.2} position={[0, 0, 0]} />
        <pointLight position={[0, 2, 2]} intensity={3} distance={8} color="#FFFAF0" />
        <pointLight position={[0, 1, -1]} intensity={1.5} distance={5} color="#FFE4B5" />
      </group>
    </group>
  );
});

useGLTF.preload('/models/oshawott.glb');
