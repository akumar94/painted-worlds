"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Painting worlds — left, center, right matching the splat
const PAINTINGS = [
  {
    id: "autumn-stroll",
    label: "Autumn Stroll in Central Park",
    artist: "Childe Hassam",
    year: "1898",
    spzPath: "/paintings/autumn-stroll.spz",
    position: new THREE.Vector3(-3.0, 1.6, -4.0),
  },
  {
    id: "amber-palace",
    label: "Arrival at the Palace of Amber",
    artist: "Edwin Lord Weeks",
    year: "1883",
    spzPath: "/paintings/amber-palace.spz",
    position: new THREE.Vector3(0.0, 1.6, -5.0),
  },
  {
    id: "sainte-adresse",
    label: "Garden at Sainte-Adresse",
    artist: "Claude Monet",
    year: "1867",
    spzPath: "/paintings/sainte-adresse.spz",
    position: new THREE.Vector3(3.0, 1.6, -4.0),
  },
];

const PROXIMITY_PRELOAD = 6.0;
const PROXIMITY_HINT    = 3.0;
const PROXIMITY_ENTER   = 0.8;
const MOVE_SPEED        = 0.12;
const INITIAL_YAW       = 0;
const INITIAL_PITCH     = 0;

export default function Museum() {
  const containerRef = useRef<HTMLDivElement>(null);

  const [mode, setMode]                   = useState<"museum" | "world">("museum");
  const [transitioning, setTransitioning] = useState(false);
  const [hintPainting, setHintPainting]   = useState<(typeof PAINTINGS)[0] | null>(null);
  const [currentPainting, setCurrentPainting] = useState<(typeof PAINTINGS)[0] | null>(null);
  const [fadeOpacity, setFadeOpacity]     = useState(0);

  const museumSceneRef    = useRef<THREE.Scene | null>(null);
  const worldSceneRef     = useRef<THREE.Scene | null>(null);
  const cameraRef         = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef       = useRef<THREE.WebGLRenderer | null>(null);
  const SplatMeshRef      = useRef<any>(null);
  const keysRef           = useRef<Record<string, boolean>>({});
  const yawRef            = useRef(INITIAL_YAW);
  const pitchRef          = useRef(INITIAL_PITCH);
  const modeRef           = useRef<"museum" | "world">("museum");
  const transitioningRef  = useRef(false);
  const enteredRef        = useRef(false);
  const preloadingIdRef   = useRef<string | null>(null);
  const preloadedIdRef    = useRef<string | null>(null);
  const preloadedSplatRef = useRef<any>(null);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { transitioningRef.current = transitioning; }, [transitioning]);

  const handleEnterPainting = useCallback((painting: (typeof PAINTINGS)[0]) => {
    if (transitioningRef.current || modeRef.current !== "museum") return;
    if (preloadedIdRef.current !== painting.id || !preloadedSplatRef.current) return;

    enteredRef.current = true;
    setCurrentPainting(painting);

    const worldScene = worldSceneRef.current;
    if (worldScene) {
      while (worldScene.children.length > 0) worldScene.remove(worldScene.children[0]);
      worldScene.add(preloadedSplatRef.current);
    }

    if (cameraRef.current) cameraRef.current.position.set(0, 1.6, 0);
    yawRef.current   = 0;
    pitchRef.current = 0;
    modeRef.current  = "world";
    setMode("world");
    setHintPainting(null);
  }, []);

  const handleExitWorld = useCallback(() => {
    if (transitioningRef.current) return;
    transitioningRef.current = true;
    setTransitioning(true);
    setFadeOpacity(1);

    setTimeout(() => {
      const worldScene = worldSceneRef.current;
      if (worldScene) {
        while (worldScene.children.length > 0) worldScene.remove(worldScene.children[0]);
      }
      preloadedIdRef.current    = null;
      preloadedSplatRef.current = null;
      preloadingIdRef.current   = null;
      modeRef.current           = "museum";
      setMode("museum");
      setCurrentPainting(null);
      enteredRef.current = false;

      if (cameraRef.current) cameraRef.current.position.set(0, 1.6, 0);
      yawRef.current   = INITIAL_YAW;
      pitchRef.current = INITIAL_PITCH;

      setTimeout(() => {
        setFadeOpacity(0);
        setTransitioning(false);
        transitioningRef.current = false;
      }, 100);
    }, 600);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === "x" && modeRef.current === "world") handleExitWorld();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleExitWorld]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;

    async function init() {
      const { SplatMesh } = await import("@sparkjsdev/spark");
      SplatMeshRef.current = SplatMesh;
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(container!.clientWidth, container!.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.autoClear = false;
      container!.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      const camera = new THREE.PerspectiveCamera(
        60,
        container!.clientWidth / container!.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 1.6, 0);
      cameraRef.current = camera;

      const onMouseMove = (e: MouseEvent) => {
        if (document.pointerLockElement !== renderer.domElement) return;
        yawRef.current   -= e.movementX * 0.002;
        pitchRef.current -= e.movementY * 0.002;
        pitchRef.current  = Math.max(-Math.PI * 0.44, Math.min(Math.PI * 0.44, pitchRef.current));
      };
      document.addEventListener("mousemove", onMouseMove);
      renderer.domElement.addEventListener("click", () => {
        try { renderer.domElement.requestPointerLock(); } catch { /* ignore */ }
      });

      const museumScene = new THREE.Scene();
      museumSceneRef.current = museumScene;
      const worldScene = new THREE.Scene();
      worldSceneRef.current = worldScene;

      // Load museum splat
      try {
        new SplatMesh({
          url: "/paintings/museum.spz",
          onLoad: (mesh: any) => { if (!disposed) museumScene.add(mesh); },
        });
      } catch { /* ignore */ }

      renderer.setAnimationLoop(() => {
        if (disposed) return;

        // Camera rotation
        const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ");
        camera.quaternion.setFromEuler(euler);

        // WASD movement
        const forward = new THREE.Vector3(-Math.sin(yawRef.current), 0, -Math.cos(yawRef.current));
        const right   = new THREE.Vector3(Math.cos(yawRef.current), 0, -Math.sin(yawRef.current));
        const keys    = keysRef.current;
        if (keys["w"]) camera.position.addScaledVector(forward, MOVE_SPEED);
        if (keys["s"]) camera.position.addScaledVector(forward, -MOVE_SPEED);
        if (keys["a"]) camera.position.addScaledVector(right, -MOVE_SPEED);
        if (keys["d"]) camera.position.addScaledVector(right, MOVE_SPEED);

        // Expose camera position for debugging
        (window as any).__camPos = {
          x: +camera.position.x.toFixed(3),
          y: +camera.position.y.toFixed(3),
          z: +camera.position.z.toFixed(3),
        };

        renderer.clear();

        if (modeRef.current === "museum") {
          renderer.render(museumScene, camera);

          if (!enteredRef.current && !transitioningRef.current) {
            // Find closest painting
            let closestDist     = Infinity;
            let closestPainting: (typeof PAINTINGS)[0] | null = null;

            for (const p of PAINTINGS) {
              const dx   = camera.position.x - p.position.x;
              const dz   = camera.position.z - p.position.z;
              const dist = Math.sqrt(dx * dx + dz * dz);
              if (dist < closestDist) {
                closestDist     = dist;
                closestPainting = p;
              }
            }

            if (closestPainting && closestDist < PROXIMITY_PRELOAD) {
              const targetId = closestPainting.id;

              // Preload world splat
              if (preloadingIdRef.current !== targetId && preloadedIdRef.current !== targetId) {
                preloadedSplatRef.current = null;
                preloadedIdRef.current    = null;
                preloadingIdRef.current   = targetId;
                try {
                  new SplatMeshRef.current({
                    url: closestPainting.spzPath,
                    onLoad: (mesh: any) => {
                      if (preloadingIdRef.current === targetId) {
                        preloadedIdRef.current    = targetId;
                        preloadedSplatRef.current = mesh;
                        preloadingIdRef.current   = null;
                      }
                    },
                  });
                } catch {
                  preloadingIdRef.current = null;
                }
              }

              if (closestDist < PROXIMITY_HINT) {
                setHintPainting(closestPainting);
                if (closestDist < PROXIMITY_ENTER && preloadedIdRef.current === closestPainting.id) {
                  handleEnterPainting(closestPainting);
                }
              } else {
                setHintPainting(null);
              }
            } else {
              setHintPainting(null);
              if (preloadingIdRef.current) {
                preloadingIdRef.current   = null;
                preloadedIdRef.current    = null;
                preloadedSplatRef.current = null;
              }
            }
          }
        } else {
          renderer.render(worldScene, camera);
        }
      });

      const handleResize = () => {
        const w = container!.clientWidth;
        const h = container!.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        disposed = true;
        document.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", handleResize);
        renderer.setAnimationLoop(null);
        renderer.dispose();
        if (container && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    const cleanupPromise = init();
    return () => {
      disposed = true;
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [handleEnterPainting, handleExitWorld]);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      <div ref={containerRef} className="h-full w-full" />

      {/* Fade overlay */}
      <div
        className="absolute inset-0 bg-black pointer-events-none z-50"
        style={{ opacity: fadeOpacity, transition: "opacity 600ms ease-in-out" }}
      />

      {/* Crosshair — museum only */}
      {mode === "museum" && !transitioning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-5 h-5 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/40" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-white/40" />
          </div>
        </div>
      )}

      {/* Painting hint */}
      {hintPainting && mode === "museum" && !transitioning && (
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div className="bg-black/60 backdrop-blur-sm px-6 py-4 rounded-lg border border-amber-900/40">
            <p className="text-amber-100 text-xl" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
              {hintPainting.label}
            </p>
            <p className="text-amber-200/60 text-sm mt-1">
              {hintPainting.artist}, {hintPainting.year}
            </p>
            <p className="text-amber-100/40 text-xs mt-2 tracking-widest uppercase">
              Walk closer to step inside
            </p>
          </div>
        </div>
      )}

      {/* World title — shown when inside a painting */}
      {mode === "world" && !transitioning && currentPainting && (
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none text-center"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div className="bg-black/40 backdrop-blur-sm px-5 py-2 rounded-lg border border-amber-900/30">
            <p className="text-amber-100/70 text-sm tracking-widest uppercase">
              {currentPainting.label}
            </p>
            <p className="text-amber-200/40 text-xs mt-0.5">
              {currentPainting.artist}, {currentPainting.year}
            </p>
          </div>
        </div>
      )}

      {/* Back button */}
      {mode === "world" && !transitioning && (
        <button
          onClick={handleExitWorld}
          className="absolute top-6 left-6 z-40 px-4 py-2 bg-black/60 backdrop-blur-sm
            text-amber-100 rounded-lg border border-amber-900/40 hover:bg-black/80
            hover:border-amber-600/60 transition-all cursor-pointer text-sm"
          style={{ fontFamily: "Georgia, serif" }}
        >
          ← Back to Museum
        </button>
      )}

      {/* X key hint */}
      {mode === "world" && !transitioning && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 text-amber-200/30 text-xs
            pointer-events-none tracking-widest uppercase"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Press X to return
        </div>
      )}

      {/* Museum title */}
      {mode === "museum" && !transitioning && (
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <p className="text-amber-100/25 text-xs tracking-[0.4em] uppercase">
            Painted Worlds
          </p>
        </div>
      )}
    </div>
  );
}