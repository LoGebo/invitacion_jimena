import { useState, useMemo, useRef, useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  shaderMaterial,
  Float,
  Stars,
  Sparkles,
  useTexture
} from '@react-three/drei';
// postprocessing removed - using native lighting for glow effects
import * as THREE from 'three';
import { MathUtils } from 'three';
import * as random from 'maath/random';
import { GestureRecognizer, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';

// --- Photo paths (cat photos only) ---
const bodyPhotoPaths = [
  '/photos/wilin.png',
  '/photos/michin.jpg',
];

// --- Config (Christmas tree in a galaxy) ---
const CONFIG = {
  colors: {
    foliage: '#004225',         // Rich emerald green
    gold: '#FFD700',            // Bright gold
    silver: '#C0C0C0',          // Silver
    red: '#8B0000',             // Dark red
    burgundy: '#4A0020',        // Deep burgundy
    black: '#0a0a0a',
    white: '#FFFFFF',
    warmLight: '#FFD54F',       // Warm gold light
    lights: ['#FF0000', '#FFD700', '#00CC44', '#FF69B4', '#8B0000', '#C0C0C0'],
    borders: ['#1a1a1a', '#2a1a2a', '#1a0a0a', '#0a0a1a'],
    giftColors: ['#8B0000', '#FFD700', '#00663A', '#4A0020'],
  },
  counts: {
    foliage: 18000,
    ornaments: 60,     // Smaller elegant ornaments
    elements: 100,
    lights: 350
  },
  tree: { height: 22, radius: 9 },
  photos: { body: bodyPhotoPaths }
};

// --- Shader Material ---
const FoliageMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color(CONFIG.colors.foliage), uProgress: 0 },
  `uniform float uTime; uniform float uProgress; attribute vec3 aTargetPos; attribute float aRandom;
  varying vec2 vUv; varying float vMix;
  float cubicInOut(float t) { return t < 0.5 ? 4.0 * t * t * t : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0; }
  void main() {
    vUv = uv;
    vec3 noise = vec3(sin(uTime * 1.5 + position.x), cos(uTime + position.y), sin(uTime * 1.5 + position.z)) * 0.15;
    float t = cubicInOut(uProgress);
    vec3 finalPos = mix(position, aTargetPos + noise, t);
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_PointSize = (60.0 * (1.0 + aRandom)) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    vMix = t;
  }`,
  `uniform vec3 uColor; varying float vMix;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5)); if (r > 0.5) discard;
    vec3 finalColor = mix(uColor * 0.3, uColor * 1.2, vMix);
    gl_FragColor = vec4(finalColor, 1.0);
  }`
);
extend({ FoliageMaterial });

// --- Tree shape helper ---
const getTreePosition = () => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;
  const y = (Math.random() * h) - (h / 2);
  const normalizedY = (y + (h / 2)) / h;
  const currentRadius = rBase * (1 - normalizedY);
  const theta = Math.random() * Math.PI * 2;
  const r = Math.random() * currentRadius;
  return [r * Math.cos(theta), y, r * Math.sin(theta)];
};

// --- Foliage ---
const Foliage = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  const materialRef = useRef<any>(null);
  const { positions, targetPositions, randoms } = useMemo(() => {
    const count = CONFIG.counts.foliage;
    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const spherePoints = random.inSphere(new Float32Array(count * 3), { radius: 25 }) as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = spherePoints[i * 3];
      positions[i * 3 + 1] = spherePoints[i * 3 + 1];
      positions[i * 3 + 2] = spherePoints[i * 3 + 2];
      const [tx, ty, tz] = getTreePosition();
      targetPositions[i * 3] = tx;
      targetPositions[i * 3 + 1] = ty;
      targetPositions[i * 3 + 2] = tz;
      randoms[i] = Math.random();
    }
    return { positions, targetPositions, randoms };
  }, []);

  useFrame((rootState, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = rootState.clock.elapsedTime;
      const targetProgress = state === 'FORMED' ? 1 : 0;
      materialRef.current.uProgress = MathUtils.damp(materialRef.current.uProgress, targetProgress, 1.5, delta);
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aTargetPos" args={[targetPositions, 3]} />
        <bufferAttribute attach="attributes-aRandom" args={[randoms, 1]} />
      </bufferGeometry>
      {/* @ts-ignore */}
      <foliageMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
};

// --- Photo Ornaments ---
const PhotoOrnaments = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  const textures = useTexture(CONFIG.photos.body);
  const count = CONFIG.counts.ornaments;
  const groupRef = useRef<THREE.Group>(null);

  const borderGeometry = useMemo(() => new THREE.PlaneGeometry(1.0, 1.25), []);
  const photoGeometry = useMemo(() => new THREE.PlaneGeometry(0.85, 0.85), []);

  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const chaosPos = new THREE.Vector3((Math.random() - 0.5) * 70, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 70);
      const h = CONFIG.tree.height;
      const y = (Math.random() * h) - (h / 2);
      const rBase = CONFIG.tree.radius;
      const currentRadius = (rBase * (1 - (y + (h / 2)) / h)) + 0.5;
      const theta = Math.random() * Math.PI * 2;
      const targetPos = new THREE.Vector3(currentRadius * Math.cos(theta), y, currentRadius * Math.sin(theta));
      const isBig = Math.random() < 0.25;
      const baseScale = isBig ? 3.0 : 1.4 + Math.random() * 0.6;
      const weight = 0.8 + Math.random() * 1.2;
      const borderColor = CONFIG.colors.borders[Math.floor(Math.random() * CONFIG.colors.borders.length)];
      const rotationSpeed = {
        x: (Math.random() - 0.5) * 1.0,
        y: (Math.random() - 0.5) * 1.0,
        z: (Math.random() - 0.5) * 1.0
      };
      const chaosRotation = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      return {
        chaosPos, targetPos, scale: baseScale, weight,
        textureIndex: i % textures.length,
        borderColor,
        currentPos: chaosPos.clone(),
        chaosRotation,
        rotationSpeed,
        wobbleOffset: Math.random() * 10,
        wobbleSpeed: 0.5 + Math.random() * 0.5
      };
    });
  }, [textures, count]);

  useFrame((stateObj, delta) => {
    if (!groupRef.current) return;
    const isFormed = state === 'FORMED';
    const time = stateObj.clock.elapsedTime;
    groupRef.current.children.forEach((group, i) => {
      const objData = data[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;
      objData.currentPos.lerp(target, delta * (isFormed ? 0.8 * objData.weight : 0.5));
      group.position.copy(objData.currentPos);
      if (isFormed) {
        const targetLookPos = new THREE.Vector3(group.position.x * 2, group.position.y + 0.5, group.position.z * 2);
        group.lookAt(targetLookPos);
        const wobbleX = Math.sin(time * objData.wobbleSpeed + objData.wobbleOffset) * 0.05;
        const wobbleZ = Math.cos(time * objData.wobbleSpeed * 0.8 + objData.wobbleOffset) * 0.05;
        group.rotation.x += wobbleX;
        group.rotation.z += wobbleZ;
      } else {
        group.rotation.x += delta * objData.rotationSpeed.x;
        group.rotation.y += delta * objData.rotationSpeed.y;
        group.rotation.z += delta * objData.rotationSpeed.z;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((obj, i) => (
        <group key={i} scale={[obj.scale, obj.scale, obj.scale]} rotation={state === 'CHAOS' ? obj.chaosRotation : [0, 0, 0]}>
          <group position={[0, 0, 0.015]}>
            <mesh geometry={photoGeometry}>
              <meshStandardMaterial
                map={textures[obj.textureIndex]}
                roughness={0.5} metalness={0}
                emissive="#FFFFFF" emissiveMap={textures[obj.textureIndex]} emissiveIntensity={1.2}
                side={THREE.FrontSide}
              />
            </mesh>
            <mesh geometry={borderGeometry} position={[0, -0.12, -0.01]}>
              <meshStandardMaterial color={obj.borderColor} roughness={0.9} metalness={0} side={THREE.FrontSide} />
            </mesh>
          </group>
          <group position={[0, 0, -0.015]} rotation={[0, Math.PI, 0]}>
            <mesh geometry={photoGeometry}>
              <meshStandardMaterial
                map={textures[obj.textureIndex]}
                roughness={0.5} metalness={0}
                emissive="#FFFFFF" emissiveMap={textures[obj.textureIndex]} emissiveIntensity={1.2}
                side={THREE.FrontSide}
              />
            </mesh>
            <mesh geometry={borderGeometry} position={[0, -0.12, -0.01]}>
              <meshStandardMaterial color={obj.borderColor} roughness={0.9} metalness={0} side={THREE.FrontSide} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
};

// --- Christmas Elements ---
const ValentineElements = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  const count = CONFIG.counts.elements;
  const groupRef = useRef<THREE.Group>(null);
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(0.8, 0.8, 0.8), []);
  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(0.5, 16, 16), []);
  const caneGeometry = useMemo(() => new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8), []);

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const chaosPos = new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60);
      const h = CONFIG.tree.height;
      const y = (Math.random() * h) - (h / 2);
      const rBase = CONFIG.tree.radius;
      const currentRadius = (rBase * (1 - (y + (h / 2)) / h)) * 0.95;
      const theta = Math.random() * Math.PI * 2;
      const targetPos = new THREE.Vector3(currentRadius * Math.cos(theta), y, currentRadius * Math.sin(theta));
      const type = Math.floor(Math.random() * 3);
      let color;
      let scale = 1;
      if (type === 0) { color = CONFIG.colors.giftColors[Math.floor(Math.random() * CONFIG.colors.giftColors.length)]; scale = 0.8 + Math.random() * 0.4; }
      else if (type === 1) { color = CONFIG.colors.giftColors[Math.floor(Math.random() * CONFIG.colors.giftColors.length)]; scale = 0.6 + Math.random() * 0.4; }
      else { color = Math.random() > 0.5 ? CONFIG.colors.red : CONFIG.colors.white; scale = 0.7 + Math.random() * 0.3; }
      const rotationSpeed = { x: (Math.random() - 0.5) * 2.0, y: (Math.random() - 0.5) * 2.0, z: (Math.random() - 0.5) * 2.0 };
      return { type, chaosPos, targetPos, color, scale, currentPos: chaosPos.clone(), chaosRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI), rotationSpeed };
    });
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const isFormed = state === 'FORMED';
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const objData = data[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;
      objData.currentPos.lerp(target, delta * 1.5);
      mesh.position.copy(objData.currentPos);
      mesh.rotation.x += delta * objData.rotationSpeed.x;
      mesh.rotation.y += delta * objData.rotationSpeed.y;
      mesh.rotation.z += delta * objData.rotationSpeed.z;
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((obj, i) => {
        let geometry;
        if (obj.type === 0) geometry = boxGeometry;
        else if (obj.type === 1) geometry = sphereGeometry;
        else geometry = caneGeometry;
        return (
          <mesh key={i} scale={[obj.scale, obj.scale, obj.scale]} geometry={geometry} rotation={obj.chaosRotation}>
            <meshStandardMaterial color={obj.color} roughness={0.3} metalness={0.4} emissive={obj.color} emissiveIntensity={0.2} />
          </mesh>
        );
      })}
    </group>
  );
};

// --- Fairy Lights ---
const FairyLights = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  const count = CONFIG.counts.lights;
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.SphereGeometry(0.8, 8, 8), []);

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const chaosPos = new THREE.Vector3((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60);
      const h = CONFIG.tree.height;
      const y = (Math.random() * h) - (h / 2);
      const rBase = CONFIG.tree.radius;
      const currentRadius = (rBase * (1 - (y + (h / 2)) / h)) + 0.3;
      const theta = Math.random() * Math.PI * 2;
      const targetPos = new THREE.Vector3(currentRadius * Math.cos(theta), y, currentRadius * Math.sin(theta));
      const color = CONFIG.colors.lights[Math.floor(Math.random() * CONFIG.colors.lights.length)];
      const speed = 2 + Math.random() * 3;
      return { chaosPos, targetPos, color, speed, currentPos: chaosPos.clone(), timeOffset: Math.random() * 100 };
    });
  }, []);

  useFrame((stateObj, delta) => {
    if (!groupRef.current) return;
    const isFormed = state === 'FORMED';
    const time = stateObj.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const objData = data[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;
      objData.currentPos.lerp(target, delta * 2.0);
      const mesh = child as THREE.Mesh;
      mesh.position.copy(objData.currentPos);
      const intensity = (Math.sin(time * objData.speed + objData.timeOffset) + 1) / 2;
      if (mesh.material) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = isFormed ? 3 + intensity * 4 : 0;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((obj, i) => (
        <mesh key={i} scale={[0.15, 0.15, 0.15]} geometry={geometry}>
          <meshStandardMaterial color={obj.color} emissive={obj.color} emissiveIntensity={0} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

// --- Top Star ---
const TopStar = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  const groupRef = useRef<THREE.Group>(null);

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.3;
    const innerRadius = 0.7;
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      i === 0 ? shape.moveTo(radius * Math.cos(angle), radius * Math.sin(angle)) : shape.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
    }
    shape.closePath();
    return shape;
  }, []);

  const starGeometry = useMemo(() => {
    return new THREE.ExtrudeGeometry(starShape, {
      depth: 0.4,
      bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3,
    });
  }, [starShape]);

  const goldMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#FFD700',
    emissive: '#FFD700',
    emissiveIntensity: 2.0,
    roughness: 0.1,
    metalness: 1.0,
  }), []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      const targetScale = state === 'FORMED' ? 1 : 0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 3);
    }
  });

  return (
    <group ref={groupRef} position={[0, CONFIG.tree.height / 2 + 1.8, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <mesh geometry={starGeometry} material={goldMaterial} />
      </Float>
    </group>
  );
};

// --- 3D Scene ---
const Experience = ({ sceneState, rotationSpeed }: { sceneState: 'CHAOS' | 'FORMED'; rotationSpeed: number }) => {
  const controlsRef = useRef<any>(null);
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() + rotationSpeed);
      controlsRef.current.update();
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 60]} fov={45} />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={30}
        maxDistance={120}
        autoRotate={rotationSpeed === 0 && sceneState === 'FORMED'}
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 1.7}
      />

      <color attach="background" args={['#030010']} />
      {/* Galaxy stars - dense, colorful */}
      <Stars radius={80} depth={60} count={6000} factor={5} saturation={0.8} fade speed={0.8} />
      <Stars radius={120} depth={40} count={2000} factor={2} saturation={0.3} fade speed={0.3} />
      <Environment preset="night" background={false} />

      {/* Lighting - warm enough to see the tree green + photos */}
      <ambientLight intensity={0.5} color="#0a1a10" />
      <pointLight position={[30, 30, 30]} intensity={80} color="#FFD54F" />
      <pointLight position={[-30, 10, -30]} intensity={40} color="#4A0020" />
      <pointLight position={[0, -20, 10]} intensity={25} color="#ffffff" />
      {/* Green light to enhance the tree */}
      <pointLight position={[0, 5, 15]} intensity={30} color="#004225" distance={80} />
      {/* Warm key light for photos */}
      <pointLight position={[15, 15, 20]} intensity={50} color="#FFF5E0" distance={100} />

      <group position={[0, -6, 0]}>
        <Foliage state={sceneState} />
        <Suspense fallback={null}>
          <PhotoOrnaments state={sceneState} />
          <ValentineElements state={sceneState} />
          <FairyLights state={sceneState} />
          <TopStar state={sceneState} />
        </Suspense>
        <Sparkles count={400} scale={50} size={5} speed={0.3} opacity={0.35} color="#FFD700" />
      </group>

      {/* Galaxy nebula glow */}
      <pointLight position={[0, 0, 20]} intensity={12} color="#1a0030" distance={80} />
      <pointLight position={[-20, 10, -15]} intensity={8} color="#0a0030" distance={60} />
      <pointLight position={[20, -5, -10]} intensity={6} color="#200010" distance={50} />
    </>
  );
};

// --- Helper: distance between two landmarks ---
const landmarkDist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

// --- Detect heart shape from two hands' landmarks ---
// Landmark 4 = thumb tip, Landmark 8 = index finger tip
const detectHeart = (landmarksA: any[], landmarksB: any[]): boolean => {
  const thumbA = landmarksA[4];
  const thumbB = landmarksB[4];
  const indexA = landmarksA[8];
  const indexB = landmarksB[8];

  // Thumb tips should be close together (top of heart)
  const thumbsDist = landmarkDist(thumbA, thumbB);
  // Index finger tips should be close together (bottom of heart)
  const indexDist = landmarkDist(indexA, indexB);

  // Both pairs of fingertips need to be close (threshold ~0.12 in normalized coords)
  return thumbsDist < 0.15 && indexDist < 0.15;
};

// --- Gesture Controller with heart detection ---
const GestureController = ({ onGesture, onMove, onStatus, debugMode }: {
  onGesture: (state: 'CHAOS' | 'FORMED') => void;
  onMove: (speed: number) => void;
  onStatus: (status: string) => void;
  debugMode: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let gestureRecognizer: GestureRecognizer;
    let requestRef: number;

    const setup = async () => {
      onStatus('CARGANDO IA...');
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );
        gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2
        });
        onStatus('SOLICITANDO CAMARA...');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            onStatus('IA LISTA: HAZ UN CORAZON CON TUS MANOS ❤️');
            predictWebcam();
          }
        } else {
          onStatus('ERROR: CAMARA NO DISPONIBLE');
        }
      } catch (err: any) {
        onStatus(`ERROR: ${err.message || 'FALLO AL CARGAR'}`);
      }
    };

    const predictWebcam = () => {
      if (gestureRecognizer && videoRef.current && canvasRef.current) {
        if (videoRef.current.videoWidth > 0) {
          const results = gestureRecognizer.recognizeForVideo(videoRef.current, Date.now());
          const ctx = canvasRef.current.getContext('2d');

          // Draw debug overlay
          if (ctx && debugMode) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            if (results.landmarks) {
              for (const landmarks of results.landmarks) {
                const drawingUtils = new DrawingUtils(ctx);
                drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, { color: '#FFD700', lineWidth: 2 });
                drawingUtils.drawLandmarks(landmarks, { color: '#FF0000', lineWidth: 1 });
              }
            }
          } else if (ctx && !debugMode) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }

          // Only change state on EXPLICIT gestures - no auto-toggling
          const numHands = results.landmarks ? results.landmarks.length : 0;
          const gestures = results.gestures || [];

          // Check if any detected hand is a closed fist
          const hasClosedFist = gestures.some(
            (g: any) => g[0] && g[0].categoryName === 'Closed_Fist' && g[0].score > 0.4
          );

          if (numHands === 2) {
            const isHeart = detectHeart(results.landmarks[0], results.landmarks[1]);
            if (isHeart) {
              // Heart = open tree
              onGesture('CHAOS');
              if (debugMode) onStatus('CORAZON DETECTADO ❤️');
            } else if (hasClosedFist) {
              // Both hands closed (or at least one fist) = close tree
              onGesture('FORMED');
              if (debugMode) onStatus('PUNOS CERRADOS - CERRANDO');
            } else {
              if (debugMode) onStatus('2 MANOS');
            }
            const avgX = (results.landmarks[0][0].x + results.landmarks[1][0].x) / 2;
            const speed = (0.5 - avgX) * 0.15;
            onMove(Math.abs(speed) > 0.01 ? speed : 0);
          } else if (numHands === 1) {
            if (hasClosedFist) {
              onGesture('FORMED');
            }
            const speed = (0.5 - results.landmarks[0][0].x) * 0.15;
            onMove(Math.abs(speed) > 0.01 ? speed : 0);
            if (debugMode) onStatus(hasClosedFist ? 'PUNO - CERRANDO' : `1 MANO: ${gestures[0]?.[0]?.categoryName || '?'}`);
          } else {
            onMove(0);
          }
        }
        requestRef = requestAnimationFrame(predictWebcam);
      }
    };

    setup();
    return () => {
      cancelAnimationFrame(requestRef);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [onGesture, onMove, onStatus, debugMode]);

  return (
    <>
      <video
        ref={videoRef}
        style={{
          opacity: debugMode ? 0.6 : 0,
          position: 'fixed', top: 0, right: 0,
          width: debugMode ? '320px' : '1px',
          zIndex: debugMode ? 100 : -1,
          pointerEvents: 'none',
          transform: 'scaleX(-1)'
        }}
        playsInline muted autoPlay
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', top: 0, right: 0,
          width: debugMode ? '320px' : '1px',
          height: debugMode ? 'auto' : '1px',
          zIndex: debugMode ? 101 : -1,
          pointerEvents: 'none',
          transform: 'scaleX(-1)'
        }}
      />
    </>
  );
};

// --- Main Valentine Tree Screen ---
export function ValentineTree() {
  const [sceneState, setSceneState] = useState<'CHAOS' | 'FORMED'>('CHAOS');
  const [rotationSpeed, setRotationSpeed] = useState(0);
  const [aiStatus, setAiStatus] = useState('INICIANDO...');
  const [debugMode, setDebugMode] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [hasFormedOnce, setHasFormedOnce] = useState(false);
  const setPhase = useGameStore((s) => s.setPhase);

  // Auto-assemble tree on first load so she sees it formed first
  useEffect(() => {
    const timer = setTimeout(() => {
      setSceneState('FORMED');
      setHasFormedOnce(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Question visible = tree is open (CHAOS) AND she's already seen the tree formed at least once
  const showQuestion = sceneState === 'CHAOS' && hasFormedOnce;

  const handleAccept = () => {
    setHasAccepted(true);
  };

  const handleBack = () => {
    setPhase('hub');
  };

  const handleGesture = useCallback((state: 'CHAOS' | 'FORMED') => setSceneState(state), []);
  const handleMove = useCallback((speed: number) => setRotationSpeed(speed), []);
  const handleStatus = useCallback((status: string) => setAiStatus(status), []);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#030010', position: 'relative', overflow: 'hidden' }}>
      {/* 3D Canvas */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <Canvas dpr={[1, 2]} gl={{ toneMapping: THREE.ReinhardToneMapping }} shadows>
          <Experience sceneState={sceneState} rotationSpeed={rotationSpeed} />
        </Canvas>
      </div>

      {/* Gesture Controller */}
      <GestureController
        onGesture={handleGesture}
        onMove={handleMove}
        onStatus={handleStatus}
        debugMode={debugMode}
      />

      {/* Valentine Question Overlay */}
      <AnimatePresence>
        {showQuestion && !hasAccepted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 20, pointerEvents: 'none',
            }}
          >
            <motion.p
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1.2 }}
              style={{
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#c4a07a',
                textShadow: '0 0 40px rgba(139, 0, 0, 0.4), 0 0 80px rgba(74, 0, 32, 0.2)',
                margin: 0,
                textAlign: 'center',
                padding: '0 1rem',
                letterSpacing: '3px',
              }}
            >
              Jimena...
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              style={{
                fontSize: 'clamp(1rem, 3.5vw, 2rem)',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                color: '#8B6060',
                textShadow: '0 0 20px rgba(139, 0, 0, 0.3)',
                marginTop: '0.8rem',
                textAlign: 'center',
                padding: '0 1rem',
                letterSpacing: '2px',
              }}
            >
              ¿Quieres ser mi San Valentin?
            </motion.p>

            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.8, duration: 0.6, type: 'spring', stiffness: 150 }}
              onClick={handleAccept}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                marginTop: '2.5rem',
                padding: '0.9rem 2.5rem',
                fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#c4a07a',
                background: 'transparent',
                border: '1px solid rgba(139, 0, 0, 0.6)',
                borderRadius: '0',
                cursor: 'pointer',
                pointerEvents: 'auto',
                boxShadow: '0 0 20px rgba(74, 0, 32, 0.3)',
                letterSpacing: '3px',
                textTransform: 'lowercase',
              }}
            >
              si, quiero
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-Accept Message - also inside the tree (visible when open) */}
      <AnimatePresence>
        {hasAccepted && sceneState === 'CHAOS' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{
              position: 'absolute',
              top: '8%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <motion.p
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 1, type: 'spring' }}
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                fontStyle: 'italic',
                color: '#c4a07a',
                textShadow: '0 0 30px rgba(139, 0, 0, 0.4)',
                margin: 0,
                letterSpacing: '3px',
              }}
            >
              te quiero, jimena
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 2, duration: 1 }}
              style={{
                fontSize: 'clamp(0.7rem, 1.5vw, 0.9rem)',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                color: '#696969',
                marginTop: '0.8rem',
                letterSpacing: '2px',
              }}
            >
              haz un corazon con tus manos para abrir el arbol
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Status */}
      <div style={{
        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
        color: aiStatus.includes('ERROR') ? '#8B0000' : 'rgba(105, 105, 105, 0.5)',
        fontSize: '9px', letterSpacing: '3px', zIndex: 10,
        background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '0',
        fontFamily: 'Georgia, serif', fontStyle: 'italic',
        borderBottom: '1px solid rgba(139, 0, 0, 0.2)',
      }}>
        {aiStatus}
      </div>

      {/* Bottom Controls */}
      <div style={{
        position: 'absolute', bottom: '30px', right: '40px', zIndex: 10,
        display: 'flex', gap: '10px',
      }}>
        <button
          onClick={() => setDebugMode(!debugMode)}
          style={{
            padding: '8px 12px',
            backgroundColor: debugMode ? 'rgba(139, 0, 0, 0.3)' : 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
            color: '#696969',
            fontFamily: 'Georgia, serif', fontSize: '10px', fontStyle: 'italic',
            cursor: 'pointer', backdropFilter: 'blur(4px)', borderRadius: '0',
            letterSpacing: '2px',
          }}
        >
          {debugMode ? 'ocultar' : 'debug'}
        </button>
        <button
          onClick={() => setSceneState(s => s === 'CHAOS' ? 'FORMED' : 'CHAOS')}
          style={{
            padding: '8px 20px',
            backgroundColor: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
            color: '#696969',
            fontFamily: 'Georgia, serif', fontSize: '11px', fontStyle: 'italic',
            letterSpacing: '2px',
            cursor: 'pointer', backdropFilter: 'blur(4px)', borderRadius: '0',
          }}
        >
          {sceneState === 'CHAOS' ? 'cerrar' : 'abrir'}
        </button>
      </div>

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        whileHover={{ opacity: 1 }}
        onClick={handleBack}
        style={{
          position: 'absolute', top: '20px', left: '20px', zIndex: 10,
          padding: '6px 14px',
          backgroundColor: 'transparent',
          border: '1px solid rgba(139, 0, 0, 0.2)',
          color: '#696969',
          fontFamily: 'Georgia, serif', fontSize: '11px', fontStyle: 'italic',
          cursor: 'pointer', borderRadius: '0',
          letterSpacing: '2px',
        }}
      >
        ← volver
      </motion.button>
    </div>
  );
}
