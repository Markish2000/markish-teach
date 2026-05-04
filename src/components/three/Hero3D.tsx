import type { FC } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion, useMediaQuery } from "@shared/hooks";
import { easeOutCubic } from "@shared/utils";
import type { Hero3DProps } from "./Hero3D.interfaces";

const DARK_NAVY = "#0e1320";
const EMISSIVE_BASE = "#0a1428";
const EMISSIVE_ACCENT = "#4d8bff";
const EDGE_COLOR = "#6ea0ff";
const PARTICLE_COLOR = "#b8d0ff";
const RING_COLOR = "#5ee9ff";

interface CubePosition {
  readonly target: THREE.Vector3;
  readonly start: THREE.Vector3;
  readonly delay: number;
  readonly isCorner: boolean;
}

const buildLatticePositions = (n: number, spacing: number): ReadonlyArray<CubePosition> => {
  const positions: CubePosition[] = [];
  const offset = ((n - 1) * spacing) / 2;
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      for (let z = 0; z < n; z++) {
        const isShell = x === 0 || x === n - 1 || y === 0 || y === n - 1 || z === 0 || z === n - 1;
        if (!isShell) continue;
        const isCorner =
          (x === 0 || x === n - 1) && (y === 0 || y === n - 1) && (z === 0 || z === n - 1);
        positions.push({
          target: new THREE.Vector3(
            x * spacing - offset,
            y * spacing - offset,
            z * spacing - offset
          ),
          start: new THREE.Vector3(
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 4
          ),
          delay: Math.random() * 0.8,
          isCorner,
        });
      }
    }
  }
  return positions;
};

const Lattice: FC<{ readonly positions: ReadonlyArray<CubePosition>; readonly reducedMotion: boolean }> = ({
  positions,
  reducedMotion,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef<number>(performance.now() / 1000);
  const cubeSize = 0.22;

  const baseMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: DARK_NAVY,
        metalness: 0.6,
        roughness: 0.25,
        emissive: new THREE.Color(EMISSIVE_BASE),
        emissiveIntensity: 0.4,
      }),
    []
  );
  const accentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: DARK_NAVY,
        metalness: 0.7,
        roughness: 0.2,
        emissive: new THREE.Color(EMISSIVE_ACCENT),
        emissiveIntensity: 0.7,
      }),
    []
  );
  const edgeMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(EDGE_COLOR),
        transparent: true,
        opacity: 0.45,
      }),
    []
  );
  const cubeGeometry = useMemo(() => new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), []);
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(cubeGeometry), [cubeGeometry]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    if (!reducedMotion) {
      group.rotation.y += 0.0028;
      group.rotation.x = Math.sin((performance.now() / 1000) * 0.4) * 0.08;
    }
    if (reducedMotion) return;
    const elapsed = performance.now() / 1000 - startTime.current;
    group.children.forEach((child, i) => {
      const config = positions[i];
      if (!config) return;
      const localElapsed = Math.max(0, elapsed - config.delay);
      const progress = Math.min(1, localElapsed / 1.4);
      const eased = easeOutCubic(progress);
      child.position.lerpVectors(config.start, config.target, eased);
      child.rotation.x = (1 - eased) * 2;
      child.rotation.y = (1 - eased) * 2;
    });
  });

  return (
    <group ref={groupRef}>
      {positions.map((config, i) => (
        <group
          key={i}
          position={reducedMotion ? config.target.toArray() : config.start.toArray()}
        >
          <mesh geometry={cubeGeometry} material={config.isCorner ? accentMat : baseMat} />
          <lineSegments geometry={edgesGeometry} material={edgeMat} />
        </group>
      ))}
    </group>
  );
};

interface RingProps {
  readonly radius: number;
  readonly tilt: number;
  readonly tube: number;
  readonly speed: number;
  readonly reducedMotion: boolean;
}

const Ring: FC<RingProps> = ({ radius, tilt, tube, speed, reducedMotion }) => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    const mesh = ref.current;
    if (reducedMotion || !mesh) return;
    mesh.rotation.z += speed * delta;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, tube, 16, 96]} />
      <meshBasicMaterial color={RING_COLOR} transparent opacity={0.35} />
    </mesh>
  );
};

const OrbitalRings: FC<{ readonly reducedMotion: boolean }> = ({ reducedMotion }) => (
  <>
    <Ring radius={1.7} tilt={Math.PI / 2.4} tube={0.003} speed={0.18} reducedMotion={reducedMotion} />
    <Ring radius={2.05} tilt={Math.PI / 3} tube={0.002} speed={-0.13} reducedMotion={reducedMotion} />
    <Ring radius={2.4} tilt={Math.PI / 2} tube={0.004} speed={0.09} reducedMotion={reducedMotion} />
  </>
);

const OrbitingNodes: FC<{ readonly count: number; readonly reducedMotion: boolean }> = ({
  count,
  reducedMotion,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const orbits = useMemo(() => {
    const list: Array<{ readonly radius: number; readonly tilt: number; readonly speed: number; readonly phase: number }> = [];
    for (let i = 0; i < count; i++) {
      list.push({
        radius: 1.7 + Math.random() * 0.7,
        tilt: Math.random() * Math.PI,
        speed: 0.2 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return list;
  }, [count]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    group.children.forEach((child, i) => {
      const orbit = orbits[i];
      if (!orbit) return;
      const angle = orbit.phase + t * orbit.speed;
      child.position.set(
        Math.cos(angle) * orbit.radius * Math.cos(orbit.tilt),
        Math.sin(angle) * orbit.radius,
        Math.cos(angle) * orbit.radius * Math.sin(orbit.tilt)
      );
    });
  });

  return (
    <group ref={groupRef}>
      {orbits.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.025, 12, 12]} />
          <meshBasicMaterial color={RING_COLOR} />
        </mesh>
      ))}
    </group>
  );
};

const ParticleField: FC<{ readonly count: number; readonly reducedMotion: boolean }> = ({
  count,
  reducedMotion,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, [count]);
  const speeds = useMemo(() => Float32Array.from({ length: count }, () => Math.random()), [count]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    const points = pointsRef.current;
    if (!points) return;
    const attr = points.geometry.attributes["position"] as THREE.BufferAttribute | undefined;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const speed = speeds[i] ?? 0;
      const yi = i * 3 + 1;
      let y = arr[yi] ?? 0;
      y += 0.0015 * speed * delta * 60;
      if (y > 4) y = -4;
      arr[yi] = y;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={PARTICLE_COLOR}
        size={0.018}
        sizeAttenuation
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const PointerParallax: FC<{ readonly reducedMotion: boolean }> = ({ reducedMotion }) => {
  const target = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const rectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const dom = gl.domElement;
    const updateRect = (): void => {
      rectRef.current = dom.getBoundingClientRect();
    };
    const onMove = (event: PointerEvent): void => {
      const rect = rectRef.current;
      if (!rect) return;
      const cx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const cy = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      target.current = { x: cx * 0.6, y: cy * 0.4 };
    };
    const onLeave = (): void => {
      target.current = { x: 0, y: 0 };
      rectRef.current = null;
    };
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            rectRef.current = null;
          });
    resizeObserver?.observe(dom);
    dom.addEventListener("pointerenter", updateRect);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerleave", onLeave);
    return () => {
      resizeObserver?.disconnect();
      dom.removeEventListener("pointerenter", updateRect);
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerleave", onLeave);
    };
  }, [gl, reducedMotion]);

  useFrame(() => {
    if (reducedMotion) return;
    const group = groupRef.current;
    if (!group) return;
    group.rotation.y += (target.current.x - group.rotation.y) * 0.04;
    group.rotation.x += (target.current.y - group.rotation.x) * 0.04;
  });

  return <group ref={groupRef}><Scene /></group>;
};

const Scene: FC = () => {
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 760px)");
  const n = isMobile ? 3 : 4;
  const positions = useMemo(() => buildLatticePositions(n, 0.42), [n]);
  return (
    <>
      <Lattice positions={positions} reducedMotion={reducedMotion} />
      <OrbitalRings reducedMotion={reducedMotion} />
      <OrbitingNodes count={isMobile ? 4 : 7} reducedMotion={reducedMotion} />
      <ParticleField count={isMobile ? 120 : 320} reducedMotion={reducedMotion} />
    </>
  );
};

export const Hero3D: FC<Hero3DProps> = () => {
  const reducedMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 760px)");
  const dpr: [number, number] = isMobile ? [1, 1.25] : [1, 1.5];

  const [paused, setPaused] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setPaused(!entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ fov: 38, position: [0, 0, 8] }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        frameloop={paused || reducedMotion ? "demand" : "always"}
      >
        <ambientLight intensity={0.35} />
        <directionalLight color="#bfd2ff" intensity={1.1} position={[3, 4, 5]} />
        <pointLight color="#5ee9ff" intensity={1.2} position={[-4, -2, -2]} />
        <pointLight color="#9c7bff" intensity={0.7} position={[4, -3, 2]} />
        <PointerParallax reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
};

export default Hero3D;
