"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ── Joint angles for each exercise at a given phase (0–1) ─── */
interface Pose {
  hipsY: number;             // vertical position of hips
  hipsRotX: number;          // hip tilt (lying down, etc.)
  torsoRotX: number;         // chest lean
  leftUpperLegRotX: number;  // upper leg fwd/back
  rightUpperLegRotX: number;
  leftLowerLegRotX: number;  // knee bend
  rightLowerLegRotX: number;
  leftUpperArmRotX: number;  // arm fwd/back
  rightUpperArmRotX: number;
  leftUpperArmRotZ: number;  // arm abduction
  rightUpperArmRotZ: number;
  leftForearmRotX: number;
  rightForearmRotX: number;
}

const STAND: Pose = {
  hipsY: 0, hipsRotX: 0, torsoRotX: 0,
  leftUpperLegRotX: 0, rightUpperLegRotX: 0,
  leftLowerLegRotX: 0, rightLowerLegRotX: 0,
  leftUpperArmRotX: 0, rightUpperArmRotX: 0,
  leftUpperArmRotZ: 0.12, rightUpperArmRotZ: -0.12,
  leftForearmRotX: 0, rightForearmRotX: 0,
};

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const l = (x: number, y: number) => THREE.MathUtils.lerp(x, y, t);
  return {
    hipsY: l(a.hipsY, b.hipsY),
    hipsRotX: l(a.hipsRotX, b.hipsRotX),
    torsoRotX: l(a.torsoRotX, b.torsoRotX),
    leftUpperLegRotX:  l(a.leftUpperLegRotX,  b.leftUpperLegRotX),
    rightUpperLegRotX: l(a.rightUpperLegRotX, b.rightUpperLegRotX),
    leftLowerLegRotX:  l(a.leftLowerLegRotX,  b.leftLowerLegRotX),
    rightLowerLegRotX: l(a.rightLowerLegRotX, b.rightLowerLegRotX),
    leftUpperArmRotX:  l(a.leftUpperArmRotX,  b.leftUpperArmRotX),
    rightUpperArmRotX: l(a.rightUpperArmRotX, b.rightUpperArmRotX),
    leftUpperArmRotZ:  l(a.leftUpperArmRotZ,  b.leftUpperArmRotZ),
    rightUpperArmRotZ: l(a.rightUpperArmRotZ, b.rightUpperArmRotZ),
    leftForearmRotX:   l(a.leftForearmRotX,   b.leftForearmRotX),
    rightForearmRotX:  l(a.rightForearmRotX,  b.rightForearmRotX),
  };
}

/* ── Exercise animation functions (returns pose at time t) ──── */
function animateSQUAT(t: number): Pose {
  // Smooth squat cycle: stand → squat → stand (2s cycle)
  const phase = (Math.sin(t * Math.PI) + 1) / 2; // 0=stand, 1=bottom
  return {
    hipsY: -0.35 * phase,
    hipsRotX: 0,
    torsoRotX: 0.18 * phase,            // slight forward lean
    leftUpperLegRotX:  -0.95 * phase,   // hip flexion
    rightUpperLegRotX: -0.95 * phase,
    leftLowerLegRotX:   1.6  * phase,   // knee bend ~92°
    rightLowerLegRotX:  1.6  * phase,
    leftUpperArmRotX:  -0.7  * phase,   // arms forward for balance
    rightUpperArmRotX: -0.7  * phase,
    leftUpperArmRotZ:   0.12,
    rightUpperArmRotZ: -0.12,
    leftForearmRotX:    0.4  * phase,
    rightForearmRotX:   0.4  * phase,
  };
}

function animateJUMP_SQUAT(t: number): Pose {
  const squat  = Math.max(0, Math.sin(t * Math.PI * 1.5));
  const flight = Math.max(0, Math.sin((t - 0.5) * Math.PI * 2));
  return {
    hipsY: -0.3 * squat + 0.45 * flight,
    hipsRotX: 0,
    torsoRotX: 0.2 * squat,
    leftUpperLegRotX:  -0.9 * squat - 0.2 * flight,
    rightUpperLegRotX: -0.9 * squat - 0.2 * flight,
    leftLowerLegRotX:   1.5 * squat + 0.3 * flight,
    rightLowerLegRotX:  1.5 * squat + 0.3 * flight,
    leftUpperArmRotX:  -0.6 * squat - 1.2 * flight,
    rightUpperArmRotX: -0.6 * squat - 1.2 * flight,
    leftUpperArmRotZ:   0.12,
    rightUpperArmRotZ: -0.12,
    leftForearmRotX:    0,
    rightForearmRotX:   0,
  };
}

function animateLUNGE(t: number, side: 1 | -1 = 1): Pose {
  const phase = (Math.sin(t * Math.PI) + 1) / 2;
  return {
    hipsY: -0.22 * phase,
    hipsRotX: 0,
    torsoRotX: 0.08,
    // Front leg (left)
    leftUpperLegRotX:  -0.85 * phase * side,
    rightUpperLegRotX:  0.65 * phase * side,
    leftLowerLegRotX:   1.1  * phase,
    rightLowerLegRotX:  0.9  * phase,
    leftUpperArmRotX:   0.4  * phase * side,  // opposite arm swings
    rightUpperArmRotX: -0.4  * phase * side,
    leftUpperArmRotZ:   0.12,
    rightUpperArmRotZ: -0.12,
    leftForearmRotX:    0,
    rightForearmRotX:   0,
  };
}

function animateGLUTE_BRIDGE(t: number): Pose {
  const phase = (Math.sin(t * Math.PI) + 1) / 2;
  return {
    // Lying on back: rotate entire body -90° on X
    hipsY: phase * 0.3,
    hipsRotX: -Math.PI / 2 + 0.15 * phase,   // lying flat, hips raise
    torsoRotX: -0.3 * phase,
    leftUpperLegRotX:  -1.4 + 0.8  * phase,  // knees bent, feet flat
    rightUpperLegRotX: -1.4 + 0.8  * phase,
    leftLowerLegRotX:   1.8 - 0.6  * phase,
    rightLowerLegRotX:  1.8 - 0.6  * phase,
    leftUpperArmRotX:   0.2,  // arms flat at sides
    rightUpperArmRotX:  0.2,
    leftUpperArmRotZ:   0.5,
    rightUpperArmRotZ: -0.5,
    leftForearmRotX:    0,
    rightForearmRotX:   0,
  };
}

function animateHIP_CIRCLES(t: number): Pose {
  return {
    hipsY: 0,
    hipsRotX: Math.sin(t * Math.PI * 2) * 0.15,
    torsoRotX: Math.sin(t * Math.PI * 2 + 0.5) * 0.1,
    leftUpperLegRotX:  Math.sin(t * Math.PI * 2 - 0.3) * 0.12,
    rightUpperLegRotX: Math.sin(t * Math.PI * 2 + 0.3) * 0.12,
    leftLowerLegRotX:  0,
    rightLowerLegRotX: 0,
    leftUpperArmRotX:  0,
    rightUpperArmRotX: 0,
    leftUpperArmRotZ:  0.25 + Math.sin(t * Math.PI * 2) * 0.1,
    rightUpperArmRotZ: -0.25 - Math.sin(t * Math.PI * 2) * 0.1,
    leftForearmRotX:   0,
    rightForearmRotX:  0,
  };
}

function animateWALL_SIT(): Pose {
  return {
    hipsY: -0.35,
    hipsRotX: 0.05,
    torsoRotX: -0.05,                 // back straight
    leftUpperLegRotX:  -1.55,         // thighs parallel to floor
    rightUpperLegRotX: -1.55,
    leftLowerLegRotX:   1.55,         // calves vertical
    rightLowerLegRotX:  1.55,
    leftUpperArmRotX:   0,
    rightUpperArmRotX:  0,
    leftUpperArmRotZ:   0.15,
    rightUpperArmRotZ: -0.15,
    leftForearmRotX:    0.4,          // hands on knees
    rightForearmRotX:   0.4,
  };
}

function animatePLANK(): Pose {
  return {
    hipsY: -0.5,
    hipsRotX: -Math.PI / 2.1,        // prone / face-down
    torsoRotX: 0.05,
    leftUpperLegRotX:  0,
    rightUpperLegRotX: 0,
    leftLowerLegRotX:  0,
    rightLowerLegRotX: 0,
    leftUpperArmRotX:  -Math.PI / 2.2, // elbows under shoulders
    rightUpperArmRotX: -Math.PI / 2.2,
    leftUpperArmRotZ:   0.2,
    rightUpperArmRotZ: -0.2,
    leftForearmRotX:    1.5,          // forearms on ground
    rightForearmRotX:   1.5,
  };
}

function animateSTRETCH_HIP_FLEXOR(t: number): Pose {
  const hold = (Math.sin(t * 0.8) + 1) / 2 * 0.08; // subtle breathing
  return {
    hipsY: -0.25,
    hipsRotX: 0.1,
    torsoRotX: 0.12,
    leftUpperLegRotX:  -0.85,   // front leg
    rightUpperLegRotX:  0.7,    // rear leg on ground
    leftLowerLegRotX:   1.1,
    rightLowerLegRotX:  0.2,
    leftUpperArmRotX:   0 + hold,
    rightUpperArmRotX:  0 + hold,
    leftUpperArmRotZ:   0.2,
    rightUpperArmRotZ: -0.2,
    leftForearmRotX:    0,
    rightForearmRotX:   0,
  };
}

function animateIDLE(t: number): Pose {
  const breath = Math.sin(t * 1.2) * 0.02;
  return {
    hipsY: breath * 0.3,
    hipsRotX: 0,
    torsoRotX: breath,
    leftUpperLegRotX:  0,
    rightUpperLegRotX: 0,
    leftLowerLegRotX:  0,
    rightLowerLegRotX: 0,
    leftUpperArmRotX:  Math.sin(t * 0.8 + 1) * 0.04,
    rightUpperArmRotX: Math.sin(t * 0.8) * 0.04,
    leftUpperArmRotZ:  0.12 + Math.sin(t * 0.8) * 0.02,
    rightUpperArmRotZ: -0.12 - Math.sin(t * 0.8) * 0.02,
    leftForearmRotX:   0,
    rightForearmRotX:  0,
  };
}

/* ── Map exercise name → animation function ──────────────────── */
function getAnimation(exerciseName: string, t: number): Pose {
  const name = exerciseName.toLowerCase();
  const cycle = t % 2; // 2-second cycles

  if (name.includes("squat") && name.includes("jump")) return animateJUMP_SQUAT(cycle / 2);
  if (name.includes("squat"))            return animateSQUAT(cycle / 2);
  if (name.includes("lunge"))            return animateLUNGE(cycle / 2, name.includes("reverse") ? -1 : 1);
  if (name.includes("glute bridge") || name.includes("bridge")) return animateGLUTE_BRIDGE(cycle / 2);
  if (name.includes("hip circle"))       return animateHIP_CIRCLES(t);
  if (name.includes("wall sit"))         return animateWALL_SIT();
  if (name.includes("plank"))            return animatePLANK();
  if (name.includes("hip flexor") || name.includes("stretch")) return animateSTRETCH_HIP_FLEXOR(t);
  if (name.includes("quad stretch"))     return animateSTRETCH_HIP_FLEXOR(t);

  return animateIDLE(t);
}

/* ── Body part material ──────────────────────────────────────── */
const BODY_MAT_PROPS = { roughness: 0.5, metalness: 0.15 };
const SKIN_COLOR  = "#3D8FAA";
const DARK_COLOR  = "#1E2530";
const BADGE_COLOR = "#00E676";

/* ── The articulated character component ─────────────────────── */
interface AnimatedCharacterProps {
  exerciseName: string;
  isPaused: boolean;
}

export function AnimatedCharacter({ exerciseName, isPaused }: AnimatedCharacterProps) {
  // Refs for each body part group (pivot at joint)
  const rootRef        = useRef<THREE.Group>(null);
  const hipsRef        = useRef<THREE.Group>(null);
  const torsoRef       = useRef<THREE.Group>(null);
  const headRef        = useRef<THREE.Group>(null);
  const lUpperArmRef   = useRef<THREE.Group>(null);
  const lForearmRef    = useRef<THREE.Group>(null);
  const rUpperArmRef   = useRef<THREE.Group>(null);
  const rForearmRef    = useRef<THREE.Group>(null);
  const lUpperLegRef   = useRef<THREE.Group>(null);
  const lLowerLegRef   = useRef<THREE.Group>(null);
  const rUpperLegRef   = useRef<THREE.Group>(null);
  const rLowerLegRef   = useRef<THREE.Group>(null);

  const timeRef = useRef(0);
  const currentPoseRef = useRef<Pose>({ ...STAND });

  useFrame((_, delta) => {
    if (!isPaused) timeRef.current += delta;
    const t = timeRef.current;

    const target = getAnimation(exerciseName, t);
    // Smooth interpolation (15 = fast, 5 = slow)
    const speed = 8 * delta;
    const pose = lerpPose(currentPoseRef.current, target, Math.min(1, speed));
    currentPoseRef.current = pose;

    if (!hipsRef.current) return;
    hipsRef.current.position.y    = pose.hipsY;
    hipsRef.current.rotation.x    = pose.hipsRotX;
    if (torsoRef.current)   torsoRef.current.rotation.x = pose.torsoRotX;
    if (lUpperLegRef.current) lUpperLegRef.current.rotation.x = pose.leftUpperLegRotX;
    if (rUpperLegRef.current) rUpperLegRef.current.rotation.x = pose.rightUpperLegRotX;
    if (lLowerLegRef.current) lLowerLegRef.current.rotation.x = pose.leftLowerLegRotX;
    if (rLowerLegRef.current) rLowerLegRef.current.rotation.x = pose.rightLowerLegRotX;
    if (lUpperArmRef.current) {
      lUpperArmRef.current.rotation.x = pose.leftUpperArmRotX;
      lUpperArmRef.current.rotation.z = pose.leftUpperArmRotZ;
    }
    if (rUpperArmRef.current) {
      rUpperArmRef.current.rotation.x = pose.rightUpperArmRotX;
      rUpperArmRef.current.rotation.z = pose.rightUpperArmRotZ;
    }
    if (lForearmRef.current) lForearmRef.current.rotation.x = pose.leftForearmRotX;
    if (rForearmRef.current) rForearmRef.current.rotation.x = pose.rightForearmRotX;
  });

  return (
    <group ref={rootRef} position={[0, 0, 0]}>
      {/* ── HIPS (root of skeleton) ── */}
      <group ref={hipsRef} position={[0, 0.95, 0]}>

        {/* ── TORSO ── */}
        <group ref={torsoRef}>
          {/* Torso mesh (pivot at hips center) */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <capsuleGeometry args={[0.16, 0.38, 8, 16]} />
            <meshStandardMaterial color={DARK_COLOR} {...BODY_MAT_PROPS} />
          </mesh>

          {/* Chest badge */}
          <mesh position={[0, 0.42, 0.17]}>
            <boxGeometry args={[0.1, 0.06, 0.01]} />
            <meshStandardMaterial color={BADGE_COLOR} emissive={BADGE_COLOR} emissiveIntensity={0.6} />
          </mesh>

          {/* ── HEAD ── */}
          <group ref={headRef} position={[0, 0.6, 0]}>
            <mesh castShadow>
              <sphereGeometry args={[0.14, 16, 16]} />
              <meshStandardMaterial color={SKIN_COLOR} {...BODY_MAT_PROPS} />
            </mesh>
          </group>

          {/* ── LEFT ARM ── pivot at shoulder ── */}
          <group ref={lUpperArmRef} position={[0.24, 0.5, 0]}>
            {/* Upper arm */}
            <mesh position={[0, -0.16, 0]} castShadow>
              <capsuleGeometry args={[0.065, 0.22, 6, 12]} />
              <meshStandardMaterial color={DARK_COLOR} {...BODY_MAT_PROPS} />
            </mesh>
            {/* Elbow pivot */}
            <group ref={lForearmRef} position={[0, -0.35, 0]}>
              <mesh position={[0, -0.15, 0]} castShadow>
                <capsuleGeometry args={[0.055, 0.22, 6, 12]} />
                <meshStandardMaterial color={SKIN_COLOR} {...BODY_MAT_PROPS} />
              </mesh>
            </group>
          </group>

          {/* ── RIGHT ARM ── pivot at shoulder ── */}
          <group ref={rUpperArmRef} position={[-0.24, 0.5, 0]}>
            <mesh position={[0, -0.16, 0]} castShadow>
              <capsuleGeometry args={[0.065, 0.22, 6, 12]} />
              <meshStandardMaterial color={DARK_COLOR} {...BODY_MAT_PROPS} />
            </mesh>
            <group ref={rForearmRef} position={[0, -0.35, 0]}>
              <mesh position={[0, -0.15, 0]} castShadow>
                <capsuleGeometry args={[0.055, 0.22, 6, 12]} />
                <meshStandardMaterial color={SKIN_COLOR} {...BODY_MAT_PROPS} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ── LEFT LEG ── pivot at hip socket ── */}
        <group ref={lUpperLegRef} position={[0.12, -0.04, 0]}>
          {/* Upper leg */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.085, 0.3, 8, 16]} />
            <meshStandardMaterial color={DARK_COLOR} {...BODY_MAT_PROPS} />
          </mesh>
          {/* Knee pivot */}
          <group ref={lLowerLegRef} position={[0, -0.47, 0]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <capsuleGeometry args={[0.072, 0.3, 8, 16]} />
              <meshStandardMaterial color={SKIN_COLOR} {...BODY_MAT_PROPS} />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.4, 0.06]} castShadow>
              <boxGeometry args={[0.1, 0.06, 0.2]} />
              <meshStandardMaterial color={DARK_COLOR} {...BODY_MAT_PROPS} />
            </mesh>
          </group>
        </group>

        {/* ── RIGHT LEG ── pivot at hip socket ── */}
        <group ref={rUpperLegRef} position={[-0.12, -0.04, 0]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.085, 0.3, 8, 16]} />
            <meshStandardMaterial color={DARK_COLOR} {...BODY_MAT_PROPS} />
          </mesh>
          <group ref={rLowerLegRef} position={[0, -0.47, 0]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <capsuleGeometry args={[0.072, 0.3, 8, 16]} />
              <meshStandardMaterial color={SKIN_COLOR} {...BODY_MAT_PROPS} />
            </mesh>
            <mesh position={[0, -0.4, 0.06]} castShadow>
              <boxGeometry args={[0.1, 0.06, 0.2]} />
              <meshStandardMaterial color={DARK_COLOR} {...BODY_MAT_PROPS} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}
