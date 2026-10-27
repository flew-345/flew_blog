import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  digit: string;
}

export function JellyTitleCanvas() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!root || !canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const particles: Particle[] = [];
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, speed: 0, inside: false };
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frame = 0;
    let visible = true;

    const draw = () => {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = "600 7px 'Courier New', monospace";

      let active = false;
      for (const particle of particles) {
        if (!reducedMotion.matches) {
          const dx = particle.homeX - pointer.x;
          const dy = particle.homeY - pointer.y;
          const distance = Math.hypot(dx, dy);
          const radius = width < 600 ? 78 : 132;
          let targetX = particle.homeX;
          let targetY = particle.homeY;
          if (pointer.inside && distance < radius) {
            const pressure = (1 - distance / radius) ** 2;
            const direction = distance > 0.001 ? 1 / distance : 0;
            const ripple = Math.sin(distance * 0.075) * 5;
            const push = (30 + ripple) * pressure;
            const glide = pointer.speed * 11 * pressure;
            targetX += dx * direction * push + pointer.vx * glide;
            targetY += dy * direction * push + pointer.vy * glide;
          }

          particle.vx = (particle.vx + (targetX - particle.x) * 0.13) * 0.76;
          particle.vy = (particle.vy + (targetY - particle.y) * 0.13) * 0.76;
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (
            Math.abs(particle.vx) + Math.abs(particle.vy) > 0.035 ||
            Math.abs(targetX - particle.x) + Math.abs(targetY - particle.y) > 0.35
          ) active = true;
        }

        const distance = pointer.inside
          ? Math.hypot(particle.x - pointer.x, particle.y - pointer.y)
          : Number.POSITIVE_INFINITY;
        const glow = Math.max(0, 1 - distance / (width < 600 ? 78 : 132));
        context.globalAlpha = 0.46 + glow * 0.5;
        context.fillStyle = glow > 0.18 ? "#d8fff0" : "#d4efad";
        context.fillText(particle.digit, particle.x, particle.y);
      }
      context.globalAlpha = 1;

      pointer.speed *= 0.84;
      if (active && visible && !reducedMotion.matches) {
        frame = window.requestAnimationFrame(draw);
      } else {
        frame = 0;
      }
    };

    const rebuild = () => {
      const bounds = root.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const mask = document.createElement("canvas");
      mask.width = Math.round(width);
      mask.height = Math.round(height);
      const maskContext = mask.getContext("2d");
      if (!maskContext) return;

      const fontSize = Math.min(width * 0.31, width < 600 ? 105 : 300);
      maskContext.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
      maskContext.textAlign = "center";
      maskContext.textBaseline = "middle";
      maskContext.fillStyle = "#fff";
      maskContext.fillText("FLEW", width / 2, height / 2, width * 0.92);

      const sampleStep = width < 600 ? 5.7 : 7.7;
      const pixels = maskContext.getImageData(0, 0, mask.width, mask.height).data;
      particles.length = 0;
      for (let y = 0; y < height; y += sampleStep) {
        for (let x = 0; x < width; x += sampleStep) {
          const alpha = pixels[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3];
          if (alpha > 110) {
            particles.push({
              x,
              y,
              homeX: x,
              homeY: y,
              vx: 0,
              vy: 0,
              digit: Math.random() > 0.5 ? "0" : "1",
            });
          }
        }
      }

      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      draw();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const bounds = root.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.inside = true;
      const speed = Math.hypot(event.movementX, event.movementY) / 12;
      pointer.speed = Math.min(1.4, pointer.speed + speed * 0.72);
      const length = Math.hypot(event.movementX, event.movementY) || 1;
      pointer.vx = event.movementX / length;
      pointer.vy = event.movementY / length;
      if (!frame && visible && !reducedMotion.matches) frame = window.requestAnimationFrame(draw);
      else if (!reducedMotion.matches) drawOnce();
    };

    const drawOnce = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(draw);
    };

    const handlePointerLeave = () => {
      pointer.inside = false;
      pointer.speed = 0;
      if (!frame && visible && !reducedMotion.matches) drawOnce();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame && !reducedMotion.matches) drawOnce();
      if (!visible && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    const resizeObserver = new ResizeObserver(rebuild);
    observer.observe(root);
    resizeObserver.observe(root);
    root.addEventListener("pointermove", handlePointerMove);
    root.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    function handleVisibility() {
      if (document.hidden && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (!document.hidden && visible && !frame && !reducedMotion.matches) {
        drawOnce();
      }
    }

    rebuild();
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="jelly-title" ref={rootRef}>
      <h1 className="visually-hidden">Flew</h1>
      <canvas ref={canvasRef} aria-hidden="true" />
      <noscript>FLEW</noscript>
    </div>
  );
}
