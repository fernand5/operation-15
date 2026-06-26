"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations, Html } from "@react-three/drei";
import * as THREE from "three";
import { AnimatedCharacter } from "./animated-character";
import { DEFAULT_AVATAR_URL, getAnimationForExercise, PHASE_CAMERA_PRESETS } from "@/lib/avatar-animations";
import type { CameraPreset } from "@/lib/avatar-animations";
import type { PhaseType } from "@/lib/workout-engine";

/* ── Camera controller ──────────────────────────────────────── */
const CAMERA_POSITIONS: Record<CameraPreset, [number, number, number]> = {
  front:    [0, 1.4, 2.8],
  side:     [2.2, 1.2, 1.0],
  overhead: [0, 3.5, 1.5],
  close:    [0, 1.6, 1.8],
};

function CameraRig({ preset }: { preset: CameraPreset }) {
  const { camera } = useThree();
  const target = CAMERA_POSITIONS[preset];

  useEffect(() => {
    camera.position.set(...target);
    camera.lookAt(0, 1.0, 0);
  }, [preset, camera, target]);

  return null;
}

/* PlaceholderAvatar removed — AnimatedCharacter handles all cases */

/* ── RPM avatar model with Mixamo animation ─────────────────── */
function RPMAvatarModel({
  avatarUrl,
  animationUrl,
  timeScale = 1,
  isPaused,
}: {
  avatarUrl: string;
  animationUrl: string | null;
  timeScale?: number;
  isPaused: boolean;
}) {
  const { scene } = useGLTF(avatarUrl);
  const { animations } = useGLTF(animationUrl ?? avatarUrl);
  const { actions, mixer } = useAnimations(animations, scene);

  // Play the first available animation
  useEffect(() => {
    const action = Object.values(actions)[0];
    if (!action) return;
    action.reset().play();
    action.setEffectiveTimeScale(timeScale);
    return () => { action.stop(); };
  }, [actions, timeScale]);

  // Pause / resume
  useEffect(() => {
    mixer.timeScale = isPaused ? 0 : 1;
  }, [isPaused, mixer]);

  return <primitive object={scene} position={[0, 0, 0]} />;
}

/* ── Loading spinner inside canvas ──────────────────────────── */
function Loader() {
  return (
    <Html center>
      <div
        className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "rgba(0,230,118,0.4)", borderTopColor: "transparent" }}
      />
    </Html>
  );
}

/* ── Ground plane ────────────────────────────────────────────── */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[6, 6]} />
      <meshStandardMaterial color="#0D1014" roughness={1} />
    </mesh>
  );
}

/* ── Main exported scene component ──────────────────────────── */
export interface AvatarSceneProps {
  avatarUrl?: string | null;
  exerciseName?: string;
  phase?: PhaseType;
  isPaused?: boolean;
  isRest?: boolean;
  showControls?: boolean;
  className?: string;
}

export function AvatarScene({
  avatarUrl,
  exerciseName = "default",
  phase = "activation",
  isPaused = false,
  isRest = false,
  showControls = true,
  className,
}: AvatarSceneProps) {
  const [orbitEnabled, setOrbitEnabled] = useState(false);
  const resolvedAvatarUrl = avatarUrl ?? DEFAULT_AVATAR_URL;
  const animConfig = getAnimationForExercise(isRest ? "default" : exerciseName);
  const cameraPreset = PHASE_CAMERA_PRESETS[phase] ?? "front";

  // Whether to try loading the real RPM avatar
  const useRPM = Boolean(avatarUrl);

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", minHeight: "200px" }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 1.4, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "linear-gradient(180deg, #0D1014 0%, #161B21 100%)" }}
      >
        {/* Lights */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 5, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-2, 3, -2]} intensity={0.4} color="#5393FF" />
        <pointLight position={[0, 2, 0]} intensity={0.3} color="#00E676" />

        {/* Camera */}
        <CameraRig preset={cameraPreset} />
        {showControls && (
          <OrbitControls
            enabled={orbitEnabled}
            target={[0, 1.0, 0]}
            minDistance={1}
            maxDistance={5}
            maxPolarAngle={Math.PI / 1.8}
          />
        )}

        <Ground />

        <Suspense fallback={<Loader />}>
          {/* Animated procedural character — always shown */}
          <AnimatedCharacter
            exerciseName={isRest ? "idle" : exerciseName}
            isPaused={isPaused}
          />
          {/* Optional: overlay RPM avatar when URL provided */}
          {useRPM && (
            <RPMAvatarModel
              avatarUrl={resolvedAvatarUrl}
              animationUrl={animConfig.url}
              timeScale={animConfig.timeScale}
              isPaused={isPaused}
            />
          )}
        </Suspense>
      </Canvas>

      {/* Orbit toggle */}
      {showControls && (
        <button
          onClick={() => setOrbitEnabled((v) => !v)}
          className="absolute bottom-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-[0.08em] transition-colors"
          style={{
            background: orbitEnabled ? "var(--operative-900)" : "rgba(13,16,20,0.8)",
            color: orbitEnabled ? "var(--operative-500)" : "var(--text-disabled)",
            border: `1px solid ${orbitEnabled ? "var(--operative-600)" : "var(--border-subtle)"}`,
            backdropFilter: "blur(4px)",
          }}
          aria-label={orbitEnabled ? "Lock camera" : "Free rotate camera"}
        >
          {orbitEnabled ? "🔓 Drag to rotate" : "🔒 Lock"}
        </button>
      )}

      {/* Phase / exercise label */}
      {exerciseName && exerciseName !== "default" && (
        <div
          className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-[0.1em]"
          style={{
            background: "rgba(8,10,12,0.7)",
            color: "var(--text-disabled)",
            backdropFilter: "blur(4px)",
          }}
        >
          {isRest ? "Rest" : exerciseName}
        </div>
      )}
    </div>
  );
}
