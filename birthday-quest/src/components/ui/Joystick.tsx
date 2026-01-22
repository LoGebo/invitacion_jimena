import { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../../stores/gameStore';

const JOYSTICK_SIZE = 140;
const KNOB_SIZE = 56;
const MAX_DISTANCE = (JOYSTICK_SIZE - KNOB_SIZE) / 2;
const MOVE_SPEED = 0.15;
const ISLAND_RADIUS = 7;

export function Joystick() {
  const containerRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const setAvatarPosition = useGameStore((s) => s.setAvatarPosition);
  const animationRef = useRef<number | null>(null);
  const movementRef = useRef({ x: 0, z: 0 });
  const isDragging = useRef(false);
  const centerRef = useRef({ x: 0, y: 0 });

  // Movement loop - continuous movement while joystick is held
  useEffect(() => {
    const updatePosition = () => {
      const { x: inputX, z: inputZ } = movementRef.current;

      if (Math.abs(inputX) > 0.01 || Math.abs(inputZ) > 0.01) {
        const currentPos = useGameStore.getState().avatarPosition;
        const [x, y, z] = currentPos;

        // Direct movement for follow camera (Mario 3D style)
        // Joystick left/right = X axis
        // Joystick up/down = Z axis (inverted: up = forward = -Z)
        const worldX = inputX * MOVE_SPEED;
        const worldZ = inputZ * MOVE_SPEED;

        let newX = x + worldX;
        let newZ = z + worldZ;

        // Clamp within island boundary (circular)
        const distFromCenter = Math.sqrt(newX * newX + newZ * newZ);
        if (distFromCenter > ISLAND_RADIUS) {
          const scale = ISLAND_RADIUS / distFromCenter;
          newX *= scale;
          newZ *= scale;
        }

        setAvatarPosition([newX, y, newZ]);
      }

      animationRef.current = requestAnimationFrame(updatePosition);
    };

    animationRef.current = requestAnimationFrame(updatePosition);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [setAvatarPosition]);

  const getEventPosition = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if ('clientX' in e) {
      return { x: e.clientX, y: e.clientY };
    }
    return { x: 0, y: 0 };
  };

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    isDragging.current = true;

    const pos = getEventPosition(e.nativeEvent);
    updateKnobPosition(pos.x, pos.y);
  }, []);

  const updateKnobPosition = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current || !isDragging.current) return;

    const dx = clientX - centerRef.current.x;
    const dy = clientY - centerRef.current.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const clampedDistance = Math.min(distance, MAX_DISTANCE);
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * clampedDistance;
    const clampedY = Math.sin(angle) * clampedDistance;

    knobRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`;

    // Normalize for movement (-1 to 1)
    const normalizedX = clampedX / MAX_DISTANCE;
    const normalizedZ = clampedY / MAX_DISTANCE;

    movementRef.current = { x: normalizedX, z: normalizedZ };
  }, []);

  const handleEnd = useCallback(() => {
    isDragging.current = false;
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    movementRef.current = { x: 0, z: 0 };
  }, []);

  // Global event listeners for move and end
  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const pos = getEventPosition(e);
      updateKnobPosition(pos.x, pos.y);
    };

    const handleUp = () => {
      if (isDragging.current) {
        handleEnd();
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    window.addEventListener('touchcancel', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
      window.removeEventListener('touchcancel', handleUp);
    };
  }, [handleEnd, updateKnobPosition]);

  return (
    <div
      className="fixed bottom-8 left-8 z-[9999]"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Direction indicators */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-warm-terracotta/60 font-quicksand">
        ↑
      </div>
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-warm-terracotta/60 font-quicksand">
        ↓
      </div>
      <div className="absolute top-1/2 -left-5 -translate-y-1/2 text-xs text-warm-terracotta/60 font-quicksand">
        ←
      </div>
      <div className="absolute top-1/2 -right-5 -translate-y-1/2 text-xs text-warm-terracotta/60 font-quicksand">
        →
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className="relative rounded-full flex items-center justify-center select-none cursor-pointer"
        style={{
          width: JOYSTICK_SIZE,
          height: JOYSTICK_SIZE,
          background: 'radial-gradient(circle, rgba(212, 165, 165, 0.6) 0%, rgba(212, 165, 165, 0.3) 100%)',
          backdropFilter: 'blur(10px)',
          border: '3px solid rgba(255, 251, 247, 0.8)',
          boxShadow: '0 4px 20px rgba(212, 165, 165, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.2)',
          touchAction: 'none',
        }}
      >
        {/* Inner ring for visual guide */}
        <div
          className="absolute rounded-full border-2 border-dusty-rose/30"
          style={{
            width: JOYSTICK_SIZE - 30,
            height: JOYSTICK_SIZE - 30,
          }}
        />

        {/* Knob */}
        <div
          ref={knobRef}
          className="absolute rounded-full shadow-xl pointer-events-none"
          style={{
            width: KNOB_SIZE,
            height: KNOB_SIZE,
            background: 'linear-gradient(145deg, #FFFBF7, #F8E1E7)',
            border: '3px solid rgba(212, 165, 165, 0.8)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 2px 5px rgba(255,255,255,0.8)',
            transition: 'transform 0.08s ease-out',
          }}
        />
      </div>
    </div>
  );
}
