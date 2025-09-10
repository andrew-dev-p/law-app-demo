import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  audioLevel: number;
  isActive: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioLevel,
  isActive,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const waveformRef = useRef({
    time: 0,
    frequencies: Array(5)
      .fill(0)
      .map(() => ({
        amplitude: 0,
        frequency: 0.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        targetAmplitude: 0,
      })),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Helper to draw a smooth path through points using quadratic curves
    const drawSmooth = (
      ctx: CanvasRenderingContext2D,
      pts: { x: number; y: number }[]
    ) => {
      if (pts.length < 2) return;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    };

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      const centerY = rect.height / 2;
      const baseAmplitude = isActive ? 36 : 18;
      const audioMultiplier = isActive ? audioLevel * 80 : 0;

      waveformRef.current.time += 0.02;

      // Update target amplitudes with a gentle breathing variation
      waveformRef.current.frequencies.forEach((freq, index) => {
        const variation =
          Math.sin(waveformRef.current.time * 0.5 + index) * 0.2;
        freq.targetAmplitude = baseAmplitude + audioMultiplier + variation * 12;
        freq.amplitude += (freq.targetAmplitude - freq.amplitude) * 0.08;
      });

      // Colors (center bright line + two softer outer lines)
      const brand = "#2970FF";
      const layers = [
        { width: 2.2, alpha: 0.95, phase: 0, scale: 1.0 },
        { width: 2.0, alpha: 0.45, phase: 0.6, scale: 0.85 },
        { width: 1.6, alpha: 0.35, phase: 1.2, scale: 0.7 },
      ];

      // Draw smooth, rounded waves with a strong center envelope to look circular
      layers.forEach((L, li) => {
        const freq =
          waveformRef.current.frequencies[
            li % waveformRef.current.frequencies.length
          ];
        const points: { x: number; y: number }[] = [];

        const k =
          2 *
          Math.PI *
          (1.25 + 0.15 * Math.sin(waveformRef.current.time * 0.15 + li));
        const step = 8; // fewer points + smoothing -> rounded curves

        for (let x = 0; x <= rect.width; x += step) {
          const t = x / rect.width; // 0..1
          // Circular-looking envelope (peaks in the middle, soft at edges)
          const env = Math.pow(Math.sin(Math.PI * t), 1.5); // 0 at edges, 1 at center
          const amp = freq.amplitude * L.scale * (0.35 + 0.65 * env);

          const y =
            centerY +
            Math.sin(k * t + waveformRef.current.time + L.phase + freq.phase) *
              amp;
          points.push({ x, y });
        }

        ctx.beginPath();
        ctx.lineWidth = L.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = `rgba(41,112,255,${L.alpha})`;

        if (li === 0 && isActive && audioLevel > 0.05) {
          ctx.shadowBlur = 14;
          ctx.shadowColor = brand;
        } else {
          ctx.shadowBlur = 0;
        }

        drawSmooth(ctx, points);
        ctx.stroke();
      });

      // Soft fade at the edges to mimic the reference look
      const mask = ctx.createLinearGradient(0, 0, rect.width, 0);
      mask.addColorStop(0, "rgba(255,255,255,1)");
      mask.addColorStop(0.12, "rgba(255,255,255,0)");
      mask.addColorStop(0.88, "rgba(255,255,255,0)");
      mask.addColorStop(1, "rgba(255,255,255,1)");
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = mask;
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.globalCompositeOperation = "source-over";

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioLevel, isActive]);

  return (
    <div className="w-full max-w-md h-32">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default AudioVisualizer;
