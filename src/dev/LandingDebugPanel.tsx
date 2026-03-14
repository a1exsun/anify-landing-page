/**
 * ?debug=1 — WASD move, drag rotate; record poses → paste into CameraPath DEFAULT_KEYFRAMES
 */
import { useCallback, useContext, useEffect, useState } from "react";

import { NavContext } from "@/App";
import { smoothNavScrollToHash } from "@/lib/smoothNavScroll";
import type { PerspectiveCamera } from "three";

import type { CameraKeyframeSerialized } from "@/three/CameraPath";
import type { SplatScene } from "@/three/SplatScene";

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "features", label: "Features" },
  { id: "highlights", label: "Highlights" },
  { id: "roadmap", label: "Roadmap" },
  { id: "play", label: "Play" },
] as const;

const STORAGE = "anify-landing-debug-keyframes";

function load(): Record<string, CameraKeyframeSerialized> {
  try {
    const raw = localStorage.getItem(STORAGE);
    if (!raw) return {};
    const o = JSON.parse(raw) as Record<string, CameraKeyframeSerialized>;
    return typeof o === "object" && o !== null ? o : {};
  } catch {
    return {};
  }
}

function save(m: Record<string, CameraKeyframeSerialized>): void {
  localStorage.setItem(STORAGE, JSON.stringify(m));
}

function serializePose(cam: PerspectiveCamera): CameraKeyframeSerialized {
  const p = cam.position;
  const q = cam.quaternion;
  return {
    px: p.x,
    py: p.y,
    pz: p.z,
    qx: q.x,
    qy: q.y,
    qz: q.z,
    qw: q.w,
  };
}

export function LandingDebugPanel({ scene }: { scene: SplatScene | null }) {
  const [recorded, setRecorded] = useState<Record<string, CameraKeyframeSerialized>>(load);
  const [, tick] = useState(0);
  const refresh = useCallback(() => tick((n) => n + 1), []);
  const navigateToSection = useContext(NavContext);

  useEffect(() => {
    const id = setInterval(refresh, 100);
    return () => clearInterval(id);
  }, [refresh]);

  const cam = scene?.getCamera() ?? null;
  const ready = scene?.isReady() ?? false;

  const record = (id: string) => {
    if (!cam || !ready) return;
    const k = serializePose(cam);
    const next = { ...recorded, [id]: k };
    setRecorded(next);
    save(next);
  };

  const ordered: CameraKeyframeSerialized[] = SECTIONS.map(({ id }) => {
    const k = recorded[id];
    if (k) return k;
    return {
      px: 0,
      py: 0.2,
      pz: 1.35,
      qx: 0,
      qy: 0,
      qz: 0,
      qw: 1,
    };
  });

  const lines = ordered
    .map(
      (k) =>
        `  { px: ${k.px.toFixed(4)}, py: ${k.py.toFixed(4)}, pz: ${k.pz.toFixed(4)}, qx: ${k.qx.toFixed(5)}, qy: ${k.qy.toFixed(5)}, qz: ${k.qz.toFixed(5)}, qw: ${k.qw.toFixed(5)} },`,
    )
    .join("\n");

  const tsSnippet = `// CameraPath.ts — replace DEFAULT_KEYFRAMES with:\nconst DEFAULT_KEYFRAMES: CameraKeyframeSerialized[] = [\n${lines}\n];`;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-[200] max-h-[85vh] overflow-y-auto rounded-xl border border-emerald-500/50 bg-zinc-950/96 p-3 font-mono text-[10px] text-emerald-100 shadow-2xl backdrop-blur-sm sm:left-auto sm:right-3 sm:max-w-[24rem]">
      <div className="mb-1 font-bold text-emerald-300">Debug camera</div>
      <p className="mb-2 leading-snug text-emerald-200/85">
        <strong>WASD</strong> move · <strong>Q/E</strong> down/up · <strong>drag</strong> rotate.
        Jump to a section, pose, <strong>Rec</strong>, then <strong>Copy TS</strong> into{" "}
        <code className="text-white">CameraPath.ts</code> (<code className="text-white">DEFAULT_KEYFRAMES</code>).
      </p>
      {cam && ready ? (
        <div className="mb-2 rounded border border-white/10 bg-black/50 p-2 text-amber-200/90">
          pos ({cam.position.x.toFixed(3)}, {cam.position.y.toFixed(3)},{" "}
          {cam.position.z.toFixed(3)})
          <br />
          quat ({cam.quaternion.x.toFixed(4)}, {cam.quaternion.y.toFixed(4)},{" "}
          {cam.quaternion.z.toFixed(4)}, {cam.quaternion.w.toFixed(4)})
        </div>
      ) : (
        <div className="mb-2 text-white/50">Loading scene…</div>
      )}
      <div className="mb-2 flex flex-wrap gap-1">
        {SECTIONS.map(({ id, label }) => (
          <div key={id} className="flex gap-0.5">
            <button
              type="button"
              className="rounded bg-white/10 px-1.5 py-0.5 hover:bg-white/20"
              onClick={() => (navigateToSection ?? smoothNavScrollToHash)(`#${id}`)}
            >
              {label}
            </button>
            <button
              type="button"
              disabled={!ready}
              className="rounded bg-emerald-700 px-1.5 py-0.5 hover:bg-emerald-600 disabled:opacity-40"
              onClick={() => record(id)}
            >
              Rec
            </button>
          </div>
        ))}
      </div>
      <pre className="mb-2 max-h-36 overflow-auto whitespace-pre-wrap break-all rounded border border-white/10 bg-black/60 p-2 text-[9px] text-cyan-200/95">
        {tsSnippet}
      </pre>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded bg-cyan-700 px-2 py-1 hover:bg-cyan-600"
          onClick={() => void navigator.clipboard.writeText(tsSnippet)}
        >
          Copy TS
        </button>
        <button
          type="button"
          className="rounded bg-red-900/80 px-2 py-1 hover:bg-red-800"
          onClick={() => {
            localStorage.removeItem(STORAGE);
            setRecorded({});
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
