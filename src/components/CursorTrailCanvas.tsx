import { useEffect, useRef, type RefObject } from "react";

interface TrailPoint {
  x: number;
  y: number;
  life: number;
  hue: number;
}

interface CursorTrailCanvasProps {
  targetRef: RefObject<HTMLElement | null>;
}

export function CursorTrailCanvas({ targetRef }: CursorTrailCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const target = targetRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !target || !context) return;
    const drawingContext = context;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const points: TrailPoint[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let last: { x: number; y: number } | null = null;
    let hue = 164;

    const draw = () => {
      if (!context) return;
      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";

      for (let index = points.length - 1; index >= 0; index -= 1) {
        const point = points[index];
        point.life -= 0.024;
        if (point.life <= 0) points.splice(index, 1);
      }

      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const point = points[index];
        const life = Math.min(previous.life, point.life);
        if (life <= 0) continue;
        const middleX = (previous.x + point.x) / 2;
        const middleY = (previous.y + point.y) / 2;
        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.quadraticCurveTo(previous.x, previous.y, middleX, middleY);
        context.strokeStyle = `hsla(${point.hue}, 82%, 72%, ${life * 0.18})`;
        context.lineWidth = 18 * life;
        context.shadowColor = `hsla(${point.hue}, 88%, 72%, ${life * 0.32})`;
        context.shadowBlur = 20 * life;
        context.stroke();

        context.beginPath();
        context.moveTo(previous.x, previous.y);
        context.quadraticCurveTo(previous.x, previous.y, middleX, middleY);
        context.strokeStyle = `hsla(${point.hue}, 78%, 80%, ${life * 0.4})`;
        context.lineWidth = 2.5 * life;
        context.shadowBlur = 0;
        context.stroke();
      }

      context.shadowBlur = 0;
      if (points.length > 1 && visible && !motionQuery.matches && !document.hidden) {
        frame = window.requestAnimationFrame(draw);
      } else {
        frame = 0;
        if (!visible || document.hidden || !finePointer.matches || motionQuery.matches) points.length = 0;
      }
    };

    const resize = () => {
      const bounds = target.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || motionQuery.matches || event.pointerType !== "mouse") return;
      const bounds = target.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      if (x < 0 || y < 0 || x > bounds.width || y > bounds.height) {
        last = null;
        return;
      }

      if (last) {
        const distance = Math.hypot(x - last.x, y - last.y);
        const steps = Math.min(16, Math.max(1, Math.ceil(distance / 7)));
        for (let step = 1; step <= steps; step += 1) {
          const progress = step / steps;
          hue = (hue + 5) % 360;
          points.push({
            x: last.x + (x - last.x) * progress,
            y: last.y + (y - last.y) * progress,
            life: 1,
            hue,
          });
        }
        if (points.length > 80) points.splice(0, points.length - 80);
        if (!frame) frame = window.requestAnimationFrame(draw);
      }
      last = { x, y };
    };

    const handlePointerLeave = () => {
      last = null;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        points.length = 0;
        drawingContext.clearRect(0, 0, width, height);
      }
    });
    const resizeObserver = new ResizeObserver(resize);
    observer.observe(target);
    resizeObserver.observe(target);
    window.addEventListener("pointermove", handlePointerMove);
    target.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotionPreference);
    finePointer.addEventListener("change", handleMotionPreference);

    function handleVisibility() {
      if (document.hidden && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        points.length = 0;
        drawingContext.clearRect(0, 0, width, height);
      }
    }

    function handleMotionPreference() {
      points.length = 0;
      last = null;
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
      drawingContext.clearRect(0, 0, width, height);
    }

    resize();
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      target.removeEventListener("pointerleave", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotionPreference);
      finePointer.removeEventListener("change", handleMotionPreference);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [targetRef]);

  return <canvas ref={canvasRef} className="cursor-trail" aria-hidden="true" />;
}
