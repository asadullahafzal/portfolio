"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { createScreen } from "./screenTexture";
import { createDeployLog } from "./deployLogTexture";

// The hero desk: "Gaming Desktop PC" by Yolala1232 (CC BY 4.0, credited in the footer),
// compressed from 15 MB to 1.4 MB. Its monitor shows my code typing live, and a vertical
// monitor replaying this site's deploy log is added beside it.
//
// Model space: desk top at y ≈ 0.25, desk runs along z (−5.8 … 8.9) and faces +x.
// The main screen spans z −0.16 … 6.16, y 1.27 … 4.74 at x ≈ −1.3.

type Props = { progress: RefObject<number>; reducedMotion: boolean };

export const DESK_MODEL = "/models/desk.glb";

const CAM = new THREE.Vector3();

function VerticalMonitor({ texture }: { texture: THREE.Texture }) {
  const frame = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0b0b10", roughness: 0.45, metalness: 0.6 }), []);
  const display = useMemo(() => new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), [texture]);
  const W = 2.05; // along z
  const H = 3.6;
  return (
    // Beside the main monitor, angled in towards the viewer
    <group position={[-1.75, 0.25, 7.55]} rotation={[0, 0.38, 0]}>
      {/* Base + neck */}
      <mesh position={[0, 0.04, 0]} material={frame}>
        <boxGeometry args={[1.1, 0.08, 1.1]} />
      </mesh>
      <mesh position={[-0.28, 1.0, 0]} material={frame}>
        <boxGeometry args={[0.16, 1.9, 0.32]} />
      </mesh>
      {/* Bezel + screen, rotated to portrait */}
      <group position={[-0.1, 1.25 + H / 2, 0]}>
        <mesh material={frame}>
          <boxGeometry args={[0.14, H + 0.12, W + 0.12]} />
        </mesh>
        <mesh position={[0.072, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={display}>
          <planeGeometry args={[W, H]} />
        </mesh>
      </group>
    </group>
  );
}

export default function DeskModel({ progress, reducedMotion }: Props) {
  const { scene } = useGLTF(DESK_MODEL);
  // Main screen is ~6.32 × 3.47 (1.82:1); size the canvas to match so text isn't stretched
  const screen = useMemo(() => {
    // The model's screen UVs are upside down relative to glTF convention, so keep flipY on
    const sc = createScreen({ flipY: true, width: 1280, height: 704 });
    sc.typeTo(sc.total, true);
    return sc;
  }, []);
  const log = useMemo(() => createDeployLog({ flipY: true }), []);
  const group = useRef<THREE.Group>(null);
  const size = useThree((st) => st.size);
  const base = { y: -4.25, z: -1.5, scale: 0.75 };
  const state = useRef({ typed: Number.MAX_SAFE_INTEGER, hold: 0, acc: 0, cursor: true, logLines: log.total, logAcc: 0, logHold: 0 });

  // Put the live code editor on the model's monitor. three.js turns spaces in names into
  // underscores ("MY SCREEN" → "MY_SCREEN"), so match loosely.
  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh && /MY_?\s?SCREEN/i.test(obj.name)) {
        (obj as THREE.Mesh).material = new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false });
      }
    });
    return () => {
      screen.dispose();
      log.dispose();
    };
  }, [scene, screen, log]);

  useFrame((frameState, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = state.current;
    if (!reducedMotion) {
      const cursor = Math.floor(frameState.clock.elapsedTime * 2) % 2 === 0;

      // Main screen: type, pause, start over
      s.acc += dt;
      if (s.acc > 0.06) {
        s.acc = 0;
        if (s.typed > screen.total) s.typed = screen.total;
        if (s.typed < screen.total) s.typed += 3;
        else if ((s.hold += 0.06) > 3.5) {
          s.typed = 0;
          s.hold = 0;
        }
        if (s.typed !== screen.shown || cursor !== s.cursor) screen.typeTo(s.typed, cursor);
      }

      // Vertical screen: a deploy log line every 0.35 s, then replay
      s.logAcc += dt;
      if (s.logAcc > 0.35) {
        s.logAcc = 0;
        if (s.logLines < log.total) s.logLines++;
        else if ((s.logHold += 0.35) > 4) {
          s.logLines = 2;
          s.logHold = 0;
        }
      }
      if (s.logLines !== log.shown || cursor !== s.cursor) log.show(s.logLines, cursor);
      s.cursor = cursor;
    }

    // Frame the desk for the screen shape: on tall/narrow screens the camera pulls back
    // (same direction as the reference camera) and aims higher so the desk sits under the text
    const aspect = size.width / Math.max(size.height, 1);
    const pull = THREE.MathUtils.clamp(1.15 / aspect, 1, 3);
    frameState.camera.position.lerp(CAM.set(20 * pull, 3 * pull, 5 * pull), 0.15);
    frameState.camera.lookAt(0, aspect < 1 ? 2.2 * (pull - 1) : 0, 0);

    // Follow the pointer a little, and sink slightly as the hero scrolls away
    const g = group.current;
    if (g) {
      const k = Math.min(1, dt * 3);
      const p = reducedMotion ? 0 : (progress.current ?? 0);
      g.rotation.y += (-0.2 + frameState.pointer.x * 0.15 - g.rotation.y) * k;
      g.position.y += (base.y - p * 0.6 - g.position.y) * k;
    }
  });

  return (
    <>
      <hemisphereLight intensity={0.35} groundColor="black" />
      <spotLight position={[-20, 50, 10]} angle={0.12} penumbra={1} intensity={2.2} decay={0} />
      <pointLight intensity={1.2} decay={0} />
      <group ref={group} position={[0, base.y, base.z]} rotation={[-0.01, -0.2, -0.1]} scale={base.scale}>
        <primitive object={scene} />
        <VerticalMonitor texture={log.texture} />
      </group>
    </>
  );
}

useGLTF.preload(DESK_MODEL);
