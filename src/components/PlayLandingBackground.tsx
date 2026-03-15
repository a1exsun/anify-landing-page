import { useEffect, useRef } from "react";

interface FlowPoint {
  speed: number;
  axis: "h" | "v";
  lineIndex: number;
  progress: number;
  brightness: number;
  size: number;
  opacity: number;
}

interface Pulse {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

interface Scanline {
  y: number;
  speed: number;
  opacity: number;
}

function createFlowPoint(vLines: number[], hLineYs: number[]): FlowPoint {
  const axis = Math.random() > 0.4 ? "h" : "v";
  const brightness = 120 + Math.floor(Math.random() * 136);
  const size = 1 + Math.random() * 1.5;
  const speed = 0.001 + Math.random() * 0.003;
  if (axis === "h") {
    return {
      speed,
      axis,
      lineIndex: Math.floor(Math.random() * hLineYs.length),
      progress: Math.random(),
      brightness,
      size,
      opacity: 0.3 + Math.random() * 0.5,
    };
  }
  return {
    speed,
    axis,
    lineIndex: Math.floor(Math.random() * vLines.length),
    progress: Math.random(),
    brightness,
    size,
    opacity: 0.3 + Math.random() * 0.5,
  };
}

export function PlayLandingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let vLines: number[] = [];
    let hLineYs: number[] = [];
    let points: FlowPoint[] = [];
    let pulses: Pulse[] = [];
    let scanlines: Scanline[] = [];
    let time = 0;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const vSpacing = Math.max(35, w / 25);
      vLines = [];
      for (let x = 0; x <= w; x += vSpacing) vLines.push(x);
      const horizonY = h * 0.3;
      hLineYs = [];
      for (let i = 0; i < 6; i++) {
        const t = i / 6;
        hLineYs.push(horizonY * (0.15 + t * 0.85));
      }
      const lineCount = 22;
      for (let i = 0; i < lineCount; i++) {
        const t = i / lineCount;
        hLineYs.push(horizonY + (h - horizonY) * (t * t * 0.5 + t * 0.5));
      }
      const numPoints = Math.floor((w * h) / 12000);
      points = [];
      for (let i = 0; i < numPoints; i++) points.push(createFlowPoint(vLines, hLineYs));
      scanlines = [
        { y: Math.random() * h, speed: 0.3 + Math.random() * 0.5, opacity: 0.03 },
        { y: Math.random() * h, speed: 0.5 + Math.random() * 0.8, opacity: 0.02 },
      ];
    }

    function maybeSpawnPulse() {
      if (pulses.length >= 3 || Math.random() > 0.008) return;
      const vx = vLines[Math.floor(Math.random() * vLines.length)];
      const hy = hLineYs[Math.floor(Math.random() * hLineYs.length)];
      if (vx === undefined || hy === undefined) return;
      pulses.push({
        x: vx,
        y: hy,
        radius: 0,
        maxRadius: 60 + Math.random() * 80,
        opacity: 0.15 + Math.random() * 0.1,
        speed: 0.5 + Math.random() * 0.5,
      });
    }

    function draw() {
      time += 0.016;
      ctx!.clearRect(0, 0, w, h);
      ctx!.fillStyle = "#06060a";
      ctx!.fillRect(0, 0, w, h);
      const vignette = ctx!.createRadialGradient(
        w * 0.5, h * 0.4, 0,
        w * 0.5, h * 0.4, Math.max(w, h) * 0.7,
      );
      vignette.addColorStop(0, "rgba(255, 255, 255, 0.015)");
      vignette.addColorStop(0.5, "rgba(255, 255, 255, 0.005)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, w, h);
      const breathe = Math.sin(time * 0.5) * 0.01 + 0.01;
      ctx!.lineWidth = 0.5;
      for (const [i, x] of vLines.entries()) {
        const distFromCenter = Math.abs(x - w / 2) / (w / 2);
        const wave = Math.sin(time * 0.3 + i * 0.5) * 0.01;
        const alpha = Math.max(0.015, 0.04 + (1 - distFromCenter) * 0.03 + breathe + wave);
        ctx!.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }
      const horizonY = h * 0.3;
      for (const [i, y] of hLineYs.entries()) {
        const distFromHorizon = Math.abs(y - horizonY) / h;
        const wave = Math.sin(time * 0.4 + i * 0.3) * 0.01;
        const alpha = Math.max(0.015, 0.06 - distFromHorizon * 0.06 + breathe + wave);
        ctx!.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }
      ctx!.lineWidth = 1;
      for (let vi = 0; vi < vLines.length; vi += 3) {
        const ix = vLines[vi];
        if (ix === undefined) continue;
        for (let hi = 0; hi < hLineYs.length; hi += 4) {
          const iy = hLineYs[hi];
          if (iy === undefined) continue;
          const flicker = Math.sin(time * 1.5 + vi * 2.1 + hi * 3.7) * 0.5 + 0.5;
          const alpha = flicker * 0.08;
          if (alpha > 0.02) {
            ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx!.fillRect(ix - 1, iy - 1, 2, 2);
          }
        }
      }
      for (const sl of scanlines) {
        sl.y += sl.speed;
        if (sl.y > h) sl.y = -10;
        const slGrad = ctx!.createLinearGradient(0, sl.y - 5, 0, sl.y + 5);
        slGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        slGrad.addColorStop(0.5, `rgba(255, 255, 255, ${sl.opacity})`);
        slGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx!.fillStyle = slGrad;
        ctx!.fillRect(0, sl.y - 5, w, 10);
      }
      maybeSpawnPulse();
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        if (!p) continue;
        p.radius += p.speed;
        const life = 1 - p.radius / p.maxRadius;
        if (life <= 0) {
          pulses.splice(i, 1);
          continue;
        }
        ctx!.strokeStyle = `rgba(255, 255, 255, ${p.opacity * life * life})`;
        ctx!.lineWidth = 0.5;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.stroke();
        if (life > 0.7) {
          ctx!.fillStyle = `rgba(255, 255, 255, ${life * 0.15})`;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      for (const p of points) {
        p.progress += p.speed;
        if (p.progress > 1) {
          p.progress = 0;
          if (p.axis === "h") p.lineIndex = Math.floor(Math.random() * hLineYs.length);
          else p.lineIndex = Math.floor(Math.random() * vLines.length);
          p.opacity = 0.3 + Math.random() * 0.5;
          p.brightness = 120 + Math.floor(Math.random() * 136);
        }
        let px: number, py: number;
        if (p.axis === "h") {
          px = p.progress * w;
          py = hLineYs[p.lineIndex] ?? h * 0.5;
        } else {
          px = vLines[p.lineIndex] ?? w * 0.5;
          py = p.progress * h;
        }
        const edgeFade = Math.min(p.progress * 5, (1 - p.progress) * 5, 1);
        const alpha = p.opacity * edgeFade;
        const c = p.brightness;
        const trailLen = p.axis === "h" ? 80 + p.size * 20 : 60 + p.size * 15;
        const segments = 6;
        for (let s = 0; s < segments; s++) {
          const t0 = s / segments;
          const segAlpha = alpha * 0.35 * (1 - t0) * (1 - t0);
          const segWidth = p.size * 0.5 * (1 - t0 * 0.8);
          if (segAlpha < 0.005) continue;
          ctx!.strokeStyle = `rgba(${c}, ${c}, ${c}, ${segAlpha})`;
          ctx!.lineWidth = segWidth;
          ctx!.beginPath();
          if (p.axis === "h") {
            ctx!.moveTo(px - trailLen * ((s + 1) / segments), py);
            ctx!.lineTo(px - trailLen * (s / segments), py);
          } else {
            ctx!.moveTo(px, py - trailLen * ((s + 1) / segments));
            ctx!.lineTo(px, py - trailLen * (s / segments));
          }
          ctx!.stroke();
        }
        const glowR = p.size * 6;
        const glowGrad = ctx!.createRadialGradient(px, py, 0, px, py, glowR);
        glowGrad.addColorStop(0, `rgba(${c}, ${c}, ${c}, ${alpha * 0.25})`);
        glowGrad.addColorStop(1, `rgba(${c}, ${c}, ${c}, 0)`);
        ctx!.fillStyle = glowGrad;
        ctx!.fillRect(px - glowR, py - glowR, glowR * 2, glowR * 2);
        ctx!.beginPath();
        ctx!.arc(px, py, p.size * 0.8, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${c}, ${c}, ${c}, ${alpha})`;
        ctx!.fill();
      }
      const edgeV = ctx!.createRadialGradient(
        w * 0.5, h * 0.5, Math.min(w, h) * 0.3,
        w * 0.5, h * 0.5, Math.max(w, h) * 0.8,
      );
      edgeV.addColorStop(0, "rgba(0, 0, 0, 0)");
      edgeV.addColorStop(1, "rgba(0, 0, 0, 0.4)");
      ctx!.fillStyle = edgeV;
      ctx!.fillRect(0, 0, w, h);
      animRef.current = requestAnimationFrame(draw);
    }

    resize();
    animRef.current = requestAnimationFrame(draw);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
      style={{ pointerEvents: "none" }}
    />
  );
}
