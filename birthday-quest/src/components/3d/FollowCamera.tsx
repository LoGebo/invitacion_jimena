import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

interface FollowCameraProps {
  offset?: [number, number, number];
  smoothness?: number;
}

export function FollowCamera({
  offset = [0, 8, 12], // Behind and above the player
  smoothness = 0.08
}: FollowCameraProps) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());

  useFrame(() => {
    // Get player actual position from store
    const [px, py, pz] = useGameStore.getState().avatarActualPosition;

    // Calculate desired camera position (behind and above player)
    const desiredPosition = new THREE.Vector3(
      px + offset[0],
      py + offset[1],
      pz + offset[2]
    );

    // Smoothly interpolate camera position
    targetPosition.current.lerp(desiredPosition, smoothness);
    camera.position.copy(targetPosition.current);

    // Look at player position (slightly above ground)
    targetLookAt.current.lerp(
      new THREE.Vector3(px, py + 1, pz),
      smoothness * 1.5
    );
    camera.lookAt(targetLookAt.current);
  });

  return null;
}
