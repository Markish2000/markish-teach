import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  SphereGeometry,
  Timer,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { easeOutCubic } from "@shared/utils";

/**
 * Decorative hero scene in plain three.js (named imports, no React): a cube
 * lattice that assembles itself, orbital rings, orbiting nodes, rising particles
 * and a soft pointer parallax.
 *
 * Main-thread friendly: shaders are compiled with `compileAsync` (parallel
 * compilation when the GPU driver supports it) before the first frame is drawn,
 * the loop stops while the hero is off screen, and everything is disposed on
 * teardown.
 */

const DARK_NAVY = "#0e1320";
const EMISSIVE_BASE = "#0a1428";
const EMISSIVE_ACCENT = "#4d8bff";
const EDGE_COLOR = "#6ea0ff";
const PARTICLE_COLOR = "#b8d0ff";
const RING_COLOR = "#5ee9ff";

/** Per-frame increments were tuned at 60 fps; scale by delta to stay frame-rate independent. */
const FRAME = 60;

interface Cube {
  readonly node: Group;
  readonly start: Vector3;
  readonly target: Vector3;
  readonly delay: number;
}

const buildLattice = (n: number, spacing: number) => {
  const group = new Group();
  const cubes: Cube[] = [];
  const size = 0.22;
  const box = new BoxGeometry(size, size, size);
  const edges = new EdgesGeometry(box);
  const baseMat = new MeshStandardMaterial({
    color: DARK_NAVY,
    metalness: 0.6,
    roughness: 0.25,
    emissive: new Color(EMISSIVE_BASE),
    emissiveIntensity: 0.4,
  });
  const accentMat = new MeshStandardMaterial({
    color: DARK_NAVY,
    metalness: 0.7,
    roughness: 0.2,
    emissive: new Color(EMISSIVE_ACCENT),
    emissiveIntensity: 0.7,
  });
  const edgeMat = new LineBasicMaterial({ color: new Color(EDGE_COLOR), transparent: true, opacity: 0.45 });

  const offset = ((n - 1) * spacing) / 2;
  const isEdge = (v: number) => v === 0 || v === n - 1;
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      for (let z = 0; z < n; z++) {
        if (!isEdge(x) && !isEdge(y) && !isEdge(z)) continue;
        const corner = isEdge(x) && isEdge(y) && isEdge(z);
        const node = new Group();
        node.add(new Mesh(box, corner ? accentMat : baseMat), new LineSegments(edges, edgeMat));
        const start = new Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4);
        node.position.copy(start);
        group.add(node);
        cubes.push({
          node,
          start,
          target: new Vector3(x * spacing - offset, y * spacing - offset, z * spacing - offset),
          delay: Math.random() * 0.8,
        });
      }
    }
  }
  return { group, cubes };
};

const buildRings = () => {
  const material = new MeshBasicMaterial({ color: RING_COLOR, transparent: true, opacity: 0.35 });
  const specs = [
    { radius: 1.7, tilt: Math.PI / 2.4, tube: 0.003, speed: 0.18 },
    { radius: 2.05, tilt: Math.PI / 3, tube: 0.002, speed: -0.13 },
    { radius: 2.4, tilt: Math.PI / 2, tube: 0.004, speed: 0.09 },
  ];
  return specs.map(({ radius, tilt, tube, speed }) => {
    const mesh = new Mesh(new TorusGeometry(radius, tube, 16, 96), material);
    mesh.rotation.x = tilt;
    return { mesh, speed };
  });
};

const buildNodes = (count: number) => {
  const geometry = new SphereGeometry(0.025, 12, 12);
  const material = new MeshBasicMaterial({ color: RING_COLOR });
  return Array.from({ length: count }, () => ({
    mesh: new Mesh(geometry, material),
    radius: 1.7 + Math.random() * 0.7,
    tilt: Math.random() * Math.PI,
    speed: 0.2 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2,
  }));
};

const buildParticles = (count: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  const geometry = new BufferGeometry();
  const attribute = new BufferAttribute(positions, 3);
  geometry.setAttribute("position", attribute);
  const points = new Points(
    geometry,
    new PointsMaterial({
      color: PARTICLE_COLOR,
      size: 0.018,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const speeds = Float32Array.from({ length: count }, () => Math.random());
  return { points, positions, attribute, speeds };
};

/** Mounts the scene into `container` and resolves with a teardown function. */
export const mountHeroScene = async (container: HTMLElement): Promise<() => void> => {
  const isMobile = window.matchMedia("(max-width: 760px)").matches;

  const renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.opacity = "0";
  canvas.style.transition = "opacity 0.6s ease";

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  scene.add(new AmbientLight(0xffffff, 0.35));
  const key = new DirectionalLight("#bfd2ff", 1.1);
  key.position.set(3, 4, 5);
  const rim = new PointLight("#5ee9ff", 1.2);
  rim.position.set(-4, -2, -2);
  const fill = new PointLight("#9c7bff", 0.7);
  fill.position.set(4, -3, 2);
  scene.add(key, rim, fill);

  const parallax = new Group();
  scene.add(parallax);
  const lattice = buildLattice(isMobile ? 3 : 4, 0.42);
  const rings = buildRings();
  const nodes = buildNodes(isMobile ? 4 : 7);
  const particles = buildParticles(isMobile ? 120 : 320);
  parallax.add(lattice.group, ...rings.map((r) => r.mesh), ...nodes.map((n) => n.mesh), particles.points);

  const resize = (): void => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // Pointer parallax: read the canvas rect once per hover, never per frame.
  const pointer = { x: 0, y: 0 };
  let rect: DOMRect | null = null;
  const onEnter = (): void => {
    rect = canvas.getBoundingClientRect();
  };
  const onMove = (event: PointerEvent): void => {
    if (!rect) return;
    pointer.x = (((event.clientX - rect.left) / rect.width) * 2 - 1) * 0.6;
    pointer.y = (((event.clientY - rect.top) / rect.height) * 2 - 1) * 0.4;
  };
  const onLeave = (): void => {
    pointer.x = 0;
    pointer.y = 0;
    rect = null;
  };
  canvas.addEventListener("pointerenter", onEnter);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);

  const timer = new Timer();
  const frame = (timestamp: number): void => {
    timer.update(timestamp);
    const delta = Math.min(timer.getDelta(), 0.1);
    const elapsed = timer.getElapsed();
    const step = delta * FRAME;

    lattice.group.rotation.y += 0.0028 * step;
    lattice.group.rotation.x = Math.sin(elapsed * 0.4) * 0.08;
    for (const cube of lattice.cubes) {
      const eased = easeOutCubic(Math.min(1, Math.max(0, elapsed - cube.delay) / 1.4));
      cube.node.position.lerpVectors(cube.start, cube.target, eased);
      cube.node.rotation.x = cube.node.rotation.y = (1 - eased) * 2;
    }
    for (const ring of rings) ring.mesh.rotation.z += ring.speed * delta;
    for (const n of nodes) {
      const angle = n.phase + elapsed * n.speed;
      n.mesh.position.set(
        Math.cos(angle) * n.radius * Math.cos(n.tilt),
        Math.sin(angle) * n.radius,
        Math.cos(angle) * n.radius * Math.sin(n.tilt),
      );
    }
    const { positions, attribute, speeds } = particles;
    for (let i = 0; i < speeds.length; i++) {
      const yi = i * 3 + 1;
      let y = (positions[yi] ?? 0) + 0.0015 * (speeds[i] ?? 0) * step;
      if (y > 4) y = -4;
      positions[yi] = y;
    }
    attribute.needsUpdate = true;

    parallax.rotation.y += (pointer.x - parallax.rotation.y) * 0.04 * step;
    parallax.rotation.x += (pointer.y - parallax.rotation.x) * 0.04 * step;

    renderer.render(scene, camera);
  };

  // Compile every shader before the first frame so no frame pays for it.
  resize();
  container.append(canvas);
  await renderer.compileAsync(scene, camera);

  let running = false;
  const setRunning = (run: boolean): void => {
    if (run === running) return;
    running = run;
    if (run) timer.reset();
    renderer.setAnimationLoop(run ? frame : null);
  };
  const visibility = new IntersectionObserver(([entry]) => setRunning(Boolean(entry?.isIntersecting)), {
    threshold: 0.05,
  });
  visibility.observe(container);
  canvas.style.opacity = "1";

  return () => {
    setRunning(false);
    visibility.disconnect();
    resizeObserver.disconnect();
    canvas.removeEventListener("pointerenter", onEnter);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerleave", onLeave);
    scene.traverse((object) => {
      if (object instanceof Mesh || object instanceof LineSegments || object instanceof Points) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((m) => m.dispose());
      }
    });
    renderer.dispose();
    canvas.remove();
  };
};
