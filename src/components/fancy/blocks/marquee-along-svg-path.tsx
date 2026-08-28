import {
  motion,
  useAnimationFrame,
  useMotionValue,
  type PanInfo,
} from "framer-motion";
import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface MarqueeAlongSvgPathProps {
  path: string;
  viewBox?: string;
  baseVelocity?: number;
  slowdownOnHover?: boolean;
  draggable?: boolean;
  dragSensitivity?: number;
  repeat?: number;
  responsive?: boolean;
  grabCursor?: boolean;
  className?: string;
  children: ReactNode;
}

// A lightweight, self-contained port of the "Marquee Along SVG Path"
// primitive: it walks a set of children around an arbitrary SVG path at a
// constant velocity, using an invisible <path> purely for its geometry
// (getTotalLength/getPointAtLength) and imperative style updates (not
// React state) per item per frame, so item count doesn't cause re-render
// churn.
export default function MarqueeAlongSvgPath({
  path,
  viewBox = "0 0 100 100",
  baseVelocity = 8,
  slowdownOnHover = false,
  draggable = false,
  dragSensitivity = 0.1,
  repeat = 1,
  responsive = true,
  grabCursor = false,
  className,
  children,
}: MarqueeAlongSvgPathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progress = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  const childArray = Children.toArray(children);
  const childCount = childArray.length;
  const itemCount = childCount * Math.max(1, repeat);

  const [, , viewBoxWidth, viewBoxHeight] = viewBox.split(/\s+/).map(Number);

  useEffect(() => {
    if (!responsive) return;
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (!viewBoxWidth || !viewBoxHeight || rect.width === 0 || rect.height === 0) return;
      setScale({ x: rect.width / viewBoxWidth, y: rect.height / viewBoxHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [responsive, viewBoxWidth, viewBoxHeight]);

  const positionItems = useCallback(() => {
    const svgPath = pathRef.current;
    if (!svgPath) return;
    const totalLength = svgPath.getTotalLength();
    if (!totalLength || itemCount === 0) return;
    const spacing = totalLength / itemCount;

    for (let i = 0; i < itemCount; i++) {
      const item = itemRefs.current[i];
      if (!item) continue;
      let lengthAlong = (i * spacing + progress.get()) % totalLength;
      if (lengthAlong < 0) lengthAlong += totalLength;
      const point = svgPath.getPointAtLength(lengthAlong);
      const x = point.x * scale.x;
      const y = point.y * scale.y;
      item.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    }
  }, [itemCount, progress, scale]);

  useAnimationFrame((_, delta) => {
    if (!isDragging) {
      const speedFactor = slowdownOnHover && isHovering ? 0.15 : 1;
      progress.set(progress.get() + baseVelocity * speedFactor * (delta / 1000));
    }
    positionItems();
  });

  useEffect(() => {
    positionItems();
  }, [positionItems, scale]);

  function handlePan(_: unknown, info: PanInfo) {
    if (!draggable) return;
    progress.set(progress.get() - info.delta.x * dragSensitivity);
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        touchAction: draggable ? "none" : undefined,
        cursor: draggable && grabCursor ? (isDragging ? "grabbing" : "grab") : undefined,
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onPointerDown={() => draggable && setIsDragging(true)}
      onPointerUp={() => setIsDragging(false)}
      onPointerCancel={() => setIsDragging(false)}
    >
      <svg
        viewBox={viewBox}
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path ref={pathRef} d={path} fill="none" stroke="none" />
      </svg>

      {draggable && (
        <MarqueeDragSurface onPan={handlePan} onPanEnd={() => setIsDragging(false)} />
      )}

      {Array.from({ length: itemCount }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          style={{ position: "absolute", top: 0, left: 0, willChange: "transform" }}
        >
          {childArray[i % childCount]}
        </div>
      ))}
    </div>
  );
}

// A separate absolutely-positioned surface handles the drag gesture via
// framer-motion's pan recognizer, kept out of the main div so the marquee
// itself never needs to be a `motion.div` (avoids re-render on every drag
// frame — position updates go straight to refs in the parent).
function MarqueeDragSurface({
  onPan,
  onPanEnd,
}: {
  onPan: (event: unknown, info: PanInfo) => void;
  onPanEnd: () => void;
}) {
  return (
    <motion.div
      className="absolute inset-0"
      onPan={onPan}
      onPanEnd={onPanEnd}
      style={{ touchAction: "none" }}
    />
  );
}
