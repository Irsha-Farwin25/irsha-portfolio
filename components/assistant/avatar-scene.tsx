"use client";

import { Suspense, use, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";

/** Mutable inputs written by the DOM side and read every frame — no React re-renders involved. */
export interface AvatarSignals {
  /** `performance.now()` of the latest wave request; a new value starts the greeting. */
  waveAt: number;
  /** Cursor position relative to the avatar, each axis in -1..1 (x → right, y → up). */
  pointer: { x: number; y: number };
  /** Page scroll speed in px/ms; positive while scrolling down, 0 when idle. */
  scrollVelocity: number;
  /** Chat state: waiting for an answer, or an answer streaming in. */
  mode: "idle" | "thinking" | "talking";
  /** `performance.now()` of the latest "flip the card" request; a new value starts her hand swipe. */
  gestureAt: number;
  /** True while she rides her platform across the page to the hero card (or back). */
  traveling: boolean;
}

/** Her right hand on screen, as fractions of the canvas from its top-left. */
export interface HandPosition {
  x: number;
  y: number;
}

/** Length of the flip swipe, and when in it the hand flicks (the spark leaves the hand then). */
export const GESTURE_SECONDS = 1.25;
export const GESTURE_FLICK_MS = 420;

export interface AvatarModelUrls {
  /** Mixamo FBX exported "With Skin": the character mesh plus its greeting clip. */
  character: string;
  /** Mixamo FBX exported "Without Skin": just the idle loop for the same skeleton. */
  idle: string;
  /** Colour texture applied instead of the one embedded in the character FBX (see avatar-source/ scripts). */
  texture: string;
}

/** Height the model is scaled to, in scene units — the camera framing below assumes it. */
const TARGET_HEIGHT = 1.62;
const { damp, clamp, lerp, smoothstep } = THREE.MathUtils;

/**
 * The Mixamo idle plants the feet ~3× hip width apart (the greeting doesn't), so while it
 * plays each leg is turned inward by this angle (radians) to bring the feet back under the hips.
 */
const IDLE_LEG_IN = 0.134;

const WORLD_FORWARD = new THREE.Vector3(0, 0, 1);
const WORLD_RIGHT = new THREE.Vector3(1, 0, 0);
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const tmpQuat = new THREE.Quaternion();
const tmpAxis = new THREE.Vector3();
const tmpRot = new THREE.Quaternion();
const tmpPos = new THREE.Vector3();

/** Rotates a bone about a world-space axis, whatever its parent's current pose. */
function swingWorld(bone: THREE.Object3D, axis: THREE.Vector3, angle: number) {
  if (!bone.parent) return;
  bone.parent.getWorldQuaternion(tmpQuat);
  tmpAxis.copy(axis).applyQuaternion(tmpQuat.invert());
  bone.quaternion.premultiply(tmpRot.setFromAxisAngle(tmpAxis, angle));
}

/** A sideways swing (about the axis pointing out of the screen). */
const swingSideways = (bone: THREE.Object3D, angle: number) => swingWorld(bone, WORLD_FORWARD, angle);

interface LoadedAvatar {
  model: THREE.Group;
  greeting: THREE.AnimationClip;
  idle: THREE.AnimationClip;
  bones: { head?: THREE.Bone; neck?: THREE.Bone; spine?: THREE.Bone };
  /** [upper leg, foot, inward direction] per side — the foot counter-rotates to stay flat. */
  legs: [THREE.Bone, THREE.Bone, 1 | -1][];
  /** Her right arm (on the viewer's left, toward the hero card) for the flip swipe. */
  arm?: { upper: THREE.Bone; fore: THREE.Bone; hand: THREE.Bone };
}

const cache = new Map<string, Promise<LoadedAvatar>>();

/** Loads the character, idle clip and texture once per URL set; cached so React's `use` can suspend on it. */
function loadAvatar(urls: AvatarModelUrls) {
  const key = `${urls.character}|${urls.idle}|${urls.texture}`;
  let promise = cache.get(key);
  if (!promise) {
    const loader = new FBXLoader();
    promise = Promise.all([
      loader.loadAsync(urls.character),
      loader.loadAsync(urls.idle),
      new THREE.TextureLoader().loadAsync(urls.texture),
    ]).then(([model, idleSrc, texture]) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      // No mipmaps: the atlas islands butt against each other, so the shrunken mip levels
      // blend suit black with neighbouring pink/skin and draw light lines along every seam.
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      const bones: LoadedAvatar["bones"] = {};
      const named: Record<string, THREE.Bone> = {};
      model.traverse((o) => {
        if (o instanceof THREE.Bone) {
          // Mixamo names come through as e.g. "mixamorigHead" (the ":" is stripped).
          const name = o.name.replace(/^mixamorig:?/, "");
          named[name] = o;
          if (name === "Head") bones.head = o;
          else if (name === "Neck") bones.neck = o;
          else if (name === "Spine1") bones.spine = o;
        }
        if (o instanceof THREE.Mesh) {
          // Skinned bounds come from the bind pose, not the animated pose, so skip culling.
          o.frustumCulled = false;
          // Matte look (the exported Phong reads as plastic), using the cleaned + recoloured texture
          // (jeans, white sneakers) in place of the embedded one, which has streaks baked into the suit.
          const old = o.material as THREE.MeshPhongMaterial;
          if (old.map) {
            texture.flipY = old.map.flipY;
            texture.wrapS = old.map.wrapS;
            texture.wrapT = old.map.wrapT;
            old.map.dispose();
          }
          o.material = new THREE.MeshLambertMaterial({ map: texture });
          old.dispose();
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      model.scale.setScalar(TARGET_HEIGHT / Math.max(0.001, box.max.y - box.min.y));

      // Facing +Z, her left leg sits at +X, so "inward" is a negative swing for it.
      const legs: LoadedAvatar["legs"] = [];
      if (named.LeftUpLeg && named.LeftFoot) legs.push([named.LeftUpLeg, named.LeftFoot, -1]);
      if (named.RightUpLeg && named.RightFoot) legs.push([named.RightUpLeg, named.RightFoot, 1]);

      const arm =
        named.RightArm && named.RightForeArm && named.RightHand
          ? { upper: named.RightArm, fore: named.RightForeArm, hand: named.RightHand }
          : undefined;

      return { model, greeting: model.animations[0], idle: idleSrc.animations[0], bones, legs, arm };
    });
    cache.set(key, promise);
  }
  return promise;
}

const PLATFORM_ACCENT = "#818cf8";

/** Soft round gradient texture (e.g. a glow or a contact shadow) drawn on a small canvas. */
function radialTexture(stops: [offset: number, color: string][]) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * The "holo disc" she stands on: dark base, indigo glow, crisp ring with a halo and a slowly
 * turning ring of ticks. `pulse` (0..1) brightens the ring and speeds the ticks when she waves.
 */
function HoloPlatform({ pulse }: { pulse: RefObject<number> }) {
  const parts = useMemo(() => {
    const group = new THREE.Group();
    const lieFlat = <T extends THREE.Object3D>(o: T, y: number) => {
      o.rotation.x = -Math.PI / 2;
      o.position.y = y;
      group.add(o);
      return o;
    };
    const additive = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false };

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.38, 0.035, 64),
      new THREE.MeshStandardMaterial({ color: "#161a2e", metalness: 0.4, roughness: 0.5 })
    );
    base.position.y = -0.0175;
    group.add(base);

    const glowMat = new THREE.MeshBasicMaterial({
      map: radialTexture([[0, "rgba(129,140,248,0.55)"], [0.6, "rgba(129,140,248,0.14)"], [1, "rgba(129,140,248,0)"]]),
      ...additive,
    });
    lieFlat(new THREE.Mesh(new THREE.CircleGeometry(0.34, 48), glowMat), 0.002);

    lieFlat(
      new THREE.Mesh(
        new THREE.CircleGeometry(0.2, 32),
        new THREE.MeshBasicMaterial({
          map: radialTexture([[0, "rgba(0,0,0,0.6)"], [1, "rgba(0,0,0,0)"]]),
          transparent: true,
          depthWrite: false,
        })
      ),
      0.003
    );

    const ringMat = new THREE.MeshBasicMaterial({ color: PLATFORM_ACCENT, transparent: true, depthWrite: false, toneMapped: false });
    const ring = lieFlat(new THREE.Mesh(new THREE.RingGeometry(0.345, 0.36, 96), ringMat), 0.004);

    const haloMat = new THREE.MeshBasicMaterial({
      map: radialTexture([[0, "rgba(129,140,248,0)"], [0.74, "rgba(129,140,248,0)"], [0.8, "rgba(129,140,248,0.5)"], [1, "rgba(129,140,248,0)"]]),
      ...additive,
    });
    lieFlat(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), haloMat), 0.001);

    const TICKS = 40;
    const tickMat = new THREE.MeshBasicMaterial({ color: PLATFORM_ACCENT, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false });
    const ticks = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.006, 0.028), tickMat, TICKS);
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const zAxis = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i < TICKS; i++) {
      const angle = (i / TICKS) * Math.PI * 2;
      const long = i % 5 === 0 ? 1.8 : 1;
      matrix.compose(
        new THREE.Vector3(Math.cos(angle) * 0.29, Math.sin(angle) * 0.29, 0),
        rotation.setFromAxisAngle(zAxis, angle - Math.PI / 2),
        new THREE.Vector3(1, long, 1)
      );
      ticks.setMatrixAt(i, matrix);
    }
    const tickRing = lieFlat(new THREE.Group(), 0.004);
    tickRing.add(ticks);

    return {
      group,
      /** Per-frame animation: a slow "breath" on the ring and halo, boosted by the wave pulse. */
      update(time: number, delta: number, p: number) {
        const breathe = Math.sin(time * 1.6);
        ringMat.opacity = Math.min(1, 0.72 + 0.12 * breathe + 0.3 * p);
        haloMat.opacity = 0.55 + 0.1 * breathe + 0.45 * p;
        glowMat.opacity = 0.8 + 0.2 * p;
        ring.scale.setScalar(1 + 0.05 * p);
        tickRing.rotation.z += delta * (0.12 + 0.8 * p);
      },
      dispose() {
        group.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return;
          o.geometry.dispose();
          const material = o.material as THREE.MeshBasicMaterial;
          material.map?.dispose();
          material.dispose();
        });
      },
    };
  }, []);

  useEffect(() => parts.dispose, [parts]);
  useFrame(({ clock }, delta) => parts.update(clock.elapsedTime, delta, pulse.current));

  return <primitive object={parts.group} />;
}

function AvatarModel({
  urls,
  signals,
  onReady,
  handRef,
}: {
  urls: AvatarModelUrls;
  signals: RefObject<AvatarSignals>;
  onReady: () => void;
  /** Updated while she swipes, so the page can launch the spark from her hand. */
  handRef: RefObject<HandPosition>;
}) {
  const { model, greeting, idle, bones, legs, arm } = use(loadAvatar(urls));
  const anim = useRef<{ mixer: THREE.AnimationMixer; idle: THREE.AnimationAction; greet: THREE.AnimationAction } | null>(null);
  const s = useRef({
    lastWaveReq: 0,
    lastGestureReq: 0,
    gestureStart: -Infinity,
    yaw: 0,
    pitch: 0,
    lean: 0,
    pulseStart: -Infinity,
    think: 0,
    talk: 0,
    travel: 0,
  });
  /** 0..1 energy passed to the platform: jumps to 1 when she starts waving, then decays. */
  const pulse = useRef(0);

  useEffect(() => {
    const mixer = new THREE.AnimationMixer(model);
    const idleAction = mixer.clipAction(idle).play();
    const greetAction = mixer.clipAction(greeting);
    greetAction.setLoop(THREE.LoopOnce, 1);
    greetAction.clampWhenFinished = true;

    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (e.action !== greetAction) return;
      idleAction.reset().play();
      greetAction.crossFadeTo(idleAction, 0.6, false);
    };
    mixer.addEventListener("finished", onFinished);
    anim.current = { mixer, idle: idleAction, greet: greetAction };
    onReady();

    return () => {
      mixer.removeEventListener("finished", onFinished);
      mixer.stopAllAction();
      anim.current = null;
    };
  }, [model, idle, greeting, onReady]);

  useFrame(({ clock, camera }, delta) => {
    const a = anim.current;
    if (!a) return;
    const st = s.current;
    const sig = signals.current;

    // A new wave request cross-fades from the idle loop into the greeting clip.
    if (sig.waveAt !== st.lastWaveReq) {
      st.lastWaveReq = sig.waveAt;
      if (!a.greet.isRunning()) {
        a.greet.reset().play();
        a.idle.crossFadeTo(a.greet, 0.35, false);
        st.pulseStart = clock.elapsedTime;
      }
    }
    a.mixer.update(Math.min(delta, 0.1));
    // Chat state eases in and out: "thinking" spins the platform faster and tilts her head as if
    // pondering; "talking" pulses the ring and adds a gentle nod.
    const t = clock.elapsedTime;
    st.think = damp(st.think, sig.mode === "thinking" ? 1 : 0, 5, delta);
    st.travel = damp(st.travel, sig.traveling ? 1 : 0, 6, delta);
    st.talk = damp(st.talk, sig.mode === "talking" ? 1 : 0, 6, delta);
    const wavePulse = Math.exp(-(t - st.pulseStart) * 1.6);
    const chatPulse = st.think * (0.45 + 0.2 * Math.sin(t * 5)) + st.talk * (0.25 + 0.3 * Math.abs(Math.sin(t * 8)));
    // Riding the platform: it glows bright and its ticks race while it carries her.
    pulse.current = Math.max(wavePulse, chatPulse, st.travel * (0.75 + 0.15 * Math.sin(t * 9)));

    // Narrow the idle's wide stance, scaled by how much of the idle is currently blended in.
    const legIn = IDLE_LEG_IN * a.idle.getEffectiveWeight();
    if (legIn > 0.001) {
      for (const [upLeg, foot, dir] of legs) {
        swingSideways(upLeg, dir * legIn);
        swingSideways(foot, -dir * legIn);
      }
    }

    // The flip swipe: she reaches her right arm out toward the hero card (the viewer's left),
    // cocks the forearm up, then flicks it across — layered on top of the idle.
    if (sig.gestureAt !== st.lastGestureReq) {
      st.lastGestureReq = sig.gestureAt;
      st.gestureStart = t;
      st.pulseStart = t + GESTURE_FLICK_MS / 1000;
      if (a.greet.isRunning()) {
        a.idle.reset().play();
        a.greet.crossFadeTo(a.idle, 0.2, false);
      }
    }
    const gt = t - st.gestureStart;
    const reach = gt >= 0 && gt < GESTURE_SECONDS ? smoothstep(gt, 0, 0.35) * (1 - smoothstep(gt, 0.85, GESTURE_SECONDS)) : 0;
    if (arm && reach > 0) {
      const flick = smoothstep(gt, 0.3, 0.62);
      swingWorld(arm.upper, WORLD_FORWARD, -1.0 * reach); // raise out to her right
      swingWorld(arm.upper, WORLD_RIGHT, -0.8 * reach); // …and forward, toward the viewer
      swingWorld(arm.fore, WORLD_FORWARD, reach * lerp(-0.9, 0.35, flick)); // cocked up, then flicked across
      swingWorld(arm.hand, WORLD_FORWARD, reach * lerp(-0.4, 0.5, flick));
      if (bones.spine) swingWorld(bones.spine, WORLD_UP, -0.22 * reach); // turn toward the card
      arm.hand.getWorldPosition(tmpPos).project(camera);
      handRef.current = { x: (tmpPos.x + 1) / 2, y: (1 - tmpPos.y) / 2 };
    }

    // Layer cursor-follow and scroll-lean on top of whatever clip is playing.
    // While greeting she looks mostly at the visitor instead of the cursor.
    const follow = 1 - 0.7 * a.greet.getEffectiveWeight();
    st.yaw = damp(st.yaw, clamp(sig.pointer.x, -1, 1) * 0.5 * follow, 4, delta);
    st.pitch = damp(st.pitch, clamp(sig.pointer.y, -1, 1) * 0.25 * follow, 4, delta);
    st.lean = damp(st.lean, clamp(sig.scrollVelocity * 0.06, -0.12, 0.12), 6, delta);
    bones.neck?.rotateY(st.yaw * 0.4 * (1 - reach));
    if (bones.head) {
      bones.head.rotateY(st.yaw * 0.6 * (1 - reach) - 0.35 * reach); // she looks at the card while swiping
      bones.head.rotateX(-st.pitch + st.talk * 0.035 * Math.sin(t * 7));
      bones.head.rotateZ(st.think * 0.1);
    }
    bones.spine?.rotateX(st.lean + st.travel * 0.08); // lean into the ride
  });

  return (
    <>
      <primitive object={model} />
      <HoloPlatform pulse={pulse} />
    </>
  );
}

export default function AvatarScene({
  urls,
  signals,
  onReady,
  handRef,
}: {
  urls: AvatarModelUrls;
  signals: RefObject<AvatarSignals>;
  onReady: () => void;
  handRef: RefObject<HandPosition>;
}) {
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      camera={{ fov: 30, near: 0.1, far: 20, position: [-0.05, 1.05, 3.6] }}
      onCreated={({ camera }) => camera.lookAt(-0.05, 0.8, 0)}
      style={{ pointerEvents: "none" }}
    >
      <directionalLight position={[1, 2, 2.5]} intensity={2.2} />
      {/* Back/rim light so the black suit keeps an outline against dark backgrounds. */}
      <directionalLight position={[-1.5, 1.8, -2]} intensity={1.3} color="#c7d2fe" />
      <directionalLight position={[1.5, 1.2, -2]} intensity={0.7} color="#c7d2fe" />
      <ambientLight intensity={1.1} />
      <Suspense fallback={null}>
        <AvatarModel urls={urls} signals={signals} onReady={onReady} handRef={handRef} />
      </Suspense>
    </Canvas>
  );
}
