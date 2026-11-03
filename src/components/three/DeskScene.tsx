"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { createScreen } from "./screenTexture";

// A developer's desk built from primitives (no downloaded models): curved ultrawide
// monitor typing out code, a PC tower with spinning lit fans, keyboard, mouse,
// speakers and a mug. Units are roughly metres; the desk top sits at y = 0.

type Props = { progress: RefObject<number>; reducedMotion: boolean };

const AMBER = "#f2a33a";
const DARK = "#1c1b19";
const METAL = "#2a2825";

// ---------------------------------------------------------------------------

function Desk() {
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#4a3a2c", roughness: 0.65, metalness: 0.05 }), []);
  const leg = useMemo(() => new THREE.MeshStandardMaterial({ color: "#151413", roughness: 0.5, metalness: 0.6 }), []);
  const legs: [number, number][] = [
    [-1.2, -0.45],
    [1.2, -0.45],
    [-1.2, 0.45],
    [1.2, 0.45],
  ];
  return (
    <group>
      <mesh position={[0, -0.03, 0]} material={wood}>
        <boxGeometry args={[2.6, 0.06, 1.1]} />
      </mesh>
      {legs.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, -0.44, z]} material={leg}>
          <boxGeometry args={[0.05, 0.76, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}

// Curved ultrawide: the screen is the inside of a slice of a cylinder
function Monitor({ screen }: { screen: ReturnType<typeof createScreen> }) {
  const R = 2.1;
  const L = 0.6; // arc angle → about 1.26 m wide
  const H = 0.56;
  const zc = -0.28; // where the middle of the screen sits
  const yc = 0.46;
  const start = Math.PI - L / 2;
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0e0d0c", roughness: 0.4, metalness: 0.5, side: THREE.DoubleSide }), []);
  const metal = useMemo(() => new THREE.MeshStandardMaterial({ color: METAL, roughness: 0.35, metalness: 0.8 }), []);
  const display = useMemo(
    () => new THREE.MeshBasicMaterial({ map: screen.texture, side: THREE.BackSide, toneMapped: false }),
    [screen],
  );
  return (
    <group>
      <group position={[0, yc, zc + R]}>
        <mesh material={display}>
          <cylinderGeometry args={[R, R, H, 64, 1, true, start, L]} />
        </mesh>
        {/* Bezel + back shell, slightly behind and larger than the screen */}
        <mesh material={frame}>
          <cylinderGeometry args={[R + 0.012, R + 0.012, H + 0.035, 64, 1, true, start - 0.012, L + 0.024]} />
        </mesh>
      </group>
      {/* Stand */}
      <mesh position={[0, 0.2, zc - 0.07]} material={metal}>
        <boxGeometry args={[0.07, 0.4, 0.035]} />
      </mesh>
      <mesh position={[0, 0.008, zc - 0.03]} material={metal}>
        <boxGeometry args={[0.46, 0.016, 0.22]} />
      </mesh>
    </group>
  );
}

function Fan({ y, blades }: { y: number; blades: (el: THREE.Group | null) => void }) {
  return (
    <group position={[0, y, 0.262]}>
      <mesh>
        <torusGeometry args={[0.075, 0.007, 8, 40]} />
        <meshStandardMaterial color="#e8892a" emissive="#e8892a" emissiveIntensity={0.75} toneMapped={false} />
      </mesh>
      <group ref={blades}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]} position={[0, 0, -0.004]}>
            <boxGeometry args={[0.014, 0.12, 0.004]} />
            <meshStandardMaterial color="#2b2926" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Tower({ fanBlades }: { fanBlades: RefObject<THREE.Group[]> }) {
  const body = useMemo(() => new THREE.MeshStandardMaterial({ color: "#121110", roughness: 0.45, metalness: 0.6 }), []);
  const glass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1a1816", roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.35 }),
    [],
  );
  return (
    <group position={[1.02, 0.28, -0.12]} rotation={[0, -0.32, 0]}>
      <mesh material={body}>
        <boxGeometry args={[0.26, 0.56, 0.52]} />
      </mesh>
      {/* Tempered-glass front with three lit fans behind it */}
      <mesh position={[0, 0, 0.262]} material={glass}>
        <planeGeometry args={[0.24, 0.54]} />
      </mesh>
      {[0.17, 0, -0.17].map((y, i) => (
        <Fan
          key={y}
          y={y}
          blades={(el) => {
            if (el && fanBlades.current) fanBlades.current[i] = el;
          }}
        />
      ))}
      {/* Warm spill from the fans */}
      <pointLight position={[0, 0, 0.45]} color={AMBER} intensity={0.6} distance={1.4} decay={2} />
      {/* Power button */}
      <mesh position={[0.06, 0.29, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.012, 16]} />
        <meshBasicMaterial color={AMBER} toneMapped={false} />
      </mesh>
    </group>
  );
}

// Reused every frame to avoid allocating
const MATRIX = new THREE.Matrix4();
const TARGET = new THREE.Vector3();

const COLS = 15;
const ROWS = 5;
const KEY = 0.034;
const GAP = 0.039;

function Keyboard({ keys }: { keys: RefObject<THREE.InstancedMesh | null> }) {
  return (
    <group position={[-0.05, 0, 0.26]}>
      <mesh position={[0, 0.011, 0]}>
        <boxGeometry args={[0.62, 0.022, 0.21]} />
        <meshStandardMaterial color="#181715" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Underglow strip */}
      <mesh position={[0, 0.002, 0.108]}>
        <boxGeometry args={[0.6, 0.003, 0.004]} />
        <meshBasicMaterial color={AMBER} toneMapped={false} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, COLS * ROWS]} position={[0, 0.029, 0]}>
        <boxGeometry args={[KEY, 0.014, KEY]} />
        <meshStandardMaterial color="#2c2a27" roughness={0.55} />
      </instancedMesh>
    </group>
  );
}

function Peripherals() {
  return (
    <group>
      {/* Mouse pad + mouse */}
      <mesh position={[0.5, 0.002, 0.27]}>
        <boxGeometry args={[0.36, 0.004, 0.28]} />
        <meshStandardMaterial color="#151413" roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.019, 0.28]} scale={[0.033, 0.017, 0.055]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#d9d5cc" roughness={0.35} />
      </mesh>

      {/* Speakers */}
      {[-0.86, 0.72].map((x) => (
        <group key={x} position={[x, 0.13, -0.18]} rotation={[0, x < 0 ? 0.25 : -0.25, 0]}>
          <mesh>
            <boxGeometry args={[0.13, 0.26, 0.13]} />
            <meshStandardMaterial color={DARK} roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, -0.03, 0.066]}>
            <circleGeometry args={[0.042, 28]} />
            <meshStandardMaterial color="#0b0a09" roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.03, 0.067]}>
            <ringGeometry args={[0.042, 0.047, 32]} />
            <meshStandardMaterial color="#3a3733" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.07, 0.066]}>
            <circleGeometry args={[0.018, 20]} />
            <meshStandardMaterial color="#0b0a09" />
          </mesh>
        </group>
      ))}

      {/* Mug */}
      <group position={[-0.84, 0, 0.3]}>
        <mesh position={[0, 0.048, 0]}>
          <cylinderGeometry args={[0.038, 0.034, 0.096, 24]} />
          <meshStandardMaterial color="#e8e4da" roughness={0.4} />
        </mesh>
        <mesh position={[0.042, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.022, 0.006, 8, 20]} />
          <meshStandardMaterial color="#e8e4da" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.094, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.034, 20]} />
          <meshStandardMaterial color="#3b2416" roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------

export default function DeskScene({ progress, reducedMotion }: Props) {
  // Opens with the code already written (so a still frame always shows it), then re-types it
  const screen = useMemo(() => {
    const sc = createScreen();
    sc.typeTo(sc.total, true);
    return sc;
  }, []);
  const group = useRef<THREE.Group>(null);
  const keys = useRef<THREE.InstancedMesh | null>(null);
  const fanBlades = useRef<THREE.Group[]>([]);
  const state = useRef({ typed: Number.MAX_SAFE_INTEGER, hold: 0, acc: 0, cursor: true, pressed: new Float32Array(COLS * ROWS) });
  const size = useThree((st) => st.size);

  useEffect(() => () => screen.dispose(), [screen]);

  // Lay out the keys once
  useEffect(() => {
    const mesh = keys.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        m.setPosition((c - (COLS - 1) / 2) * GAP, 0, (r - (ROWS - 1) / 2) * GAP);
        mesh.setMatrixAt(r * COLS + c, m);
      }
    mesh.instanceMatrix.needsUpdate = true;
    if (reducedMotion) screen.typeTo(screen.total, false);
  }, [reducedMotion, screen]);

  useFrame((frameState, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = state.current;

    if (!reducedMotion) {
      // Typing: a few characters per tick, a pause at the end, then start over
      s.acc += dt;
      if (s.acc > 0.06) {
        s.acc = 0;
        if (s.typed > screen.total) s.typed = screen.total;
        if (s.typed < screen.total) {
          s.typed += 3;
          // Press a random key for each burst of typing
          s.pressed[Math.floor(Math.random() * COLS * ROWS)] = 1;
        } else if ((s.hold += 0.06) > 3.5) {
          s.typed = 0;
          s.hold = 0;
        }
        // Only redraw (and re-upload the texture) when something visible changed
        const cursor = Math.floor(frameState.clock.elapsedTime * 2) % 2 === 0;
        if (s.typed !== screen.shown || cursor !== s.cursor) screen.typeTo(s.typed, cursor);
        s.cursor = cursor;
      }

      // Pressed keys dip and spring back
      const mesh = keys.current;
      if (mesh) {
        const m = MATRIX;
        for (let i = 0; i < s.pressed.length; i++) {
          if (s.pressed[i] <= 0) continue;
          s.pressed[i] = Math.max(0, s.pressed[i] - dt * 6);
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          m.setPosition((c - (COLS - 1) / 2) * GAP, -0.006 * s.pressed[i], (r - (ROWS - 1) / 2) * GAP);
          mesh.setMatrixAt(i, m);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }

      for (const b of fanBlades.current) if (b) b.rotation.z -= dt * 7;
    }

    // Frame the whole desk for any aspect ratio, then ease in as the hero scrolls away
    const aspect = size.width / Math.max(size.height, 1);
    const fit = THREE.MathUtils.clamp(4.3 / aspect, 2.35, 8);
    const p = reducedMotion ? 0 : (progress.current ?? 0);
    frameState.camera.position.lerp(TARGET.set(0, 0.82 - p * 0.2, fit - p * 0.7), 0.12);
    frameState.camera.lookAt(0, 0.24, 0);

    // Gentle tilt toward the pointer
    const g = group.current;
    if (g) {
      const k = Math.min(1, dt * 3);
      g.rotation.y += (frameState.pointer.x * 0.12 - g.rotation.y) * k;
      g.rotation.x += (-frameState.pointer.y * 0.04 - g.rotation.x) * k;
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} color="#fff4e6" />
      <directionalLight position={[-2.5, 3.5, 2.5]} intensity={1.6} color="#ffe2bd" />
      <directionalLight position={[3, 2, -2]} intensity={0.5} color="#c9d4ff" />
      {/* Light from the screen onto the desk and keyboard */}
      <pointLight position={[0, 0.45, 0.15]} intensity={0.9} distance={1.6} decay={2} color="#e6ecff" />

      <group ref={group}>
        <Desk />
        <Monitor screen={screen} />
        <Tower fanBlades={fanBlades} />
        <Keyboard keys={keys} />
        <Peripherals />
        {/* Soft shadows, rendered once (not every frame) to stay cheap on phones */}
        <ContactShadows position={[0, 0.001, 0]} scale={[2.6, 1.1]} opacity={0.55} blur={2.2} far={0.6} frames={1} resolution={512} />
      </group>
    </>
  );
}
