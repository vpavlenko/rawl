import React, {
  MutableRefObject,
  ReactNode,
  RefObject,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
import { unstable_batchedUpdates } from "react-dom";
import clamp from "lodash/clamp";

// Freeze the rendered score during a gesture. Chrome can scale its cached paint
// layer without recalculating note rectangles or reconciling thousands of notes.
export const ScorePinchContent = React.memo(
  ({
    children,
  }: {
    children: ReactNode;
    activeRef: MutableRefObject<boolean>;
  }) =>
    React.createElement(
      "div",
      {
        "data-score-pinch-content": "",
        // Include section end margins in the scrollable width, even when the
        // score is wider than the viewport.
        style: { width: "max-content", minWidth: "100%" },
      },
      children,
    ),
  (previous, next) =>
    next.activeRef.current || previous.children === next.children,
);

type Dimensions = { noteHeight: number; secondWidth: number };
type PinchAxis = "horizontal" | "vertical";

export function useScorePinch(
  containerRef: RefObject<HTMLDivElement>,
  noteHeight: number,
  secondWidth: number,
  setNoteHeight: (height: number) => void,
  setSecondWidth: (width: number) => void,
  enabled: boolean,
) {
  const dimensions = useRef({ noteHeight, secondWidth });
  dimensions.current = { noteHeight, secondWidth };
  const activeRef = useRef(false);
  const clearPreviewRef = useRef<(() => void) | null>(null);
  const [, refreshScore] = useReducer((revision: number) => revision + 1, 0);

  // Keep the preview visible until the real score has committed, then replace
  // it before paint. This also refreshes playback after a cancelled/no-op pinch.
  useLayoutEffect(() => {
    if (!activeRef.current) clearPreviewRef.current?.();
  });

  useEffect(() => {
    const container = containerRef.current;
    const content = container?.querySelector<HTMLDivElement>(
      "[data-score-pinch-content]",
    );
    if (!container || !content || !enabled) return;

    let base: Dimensions | null = null;
    let pending: Dimensions | null = null;
    let wheelTimer: ReturnType<typeof setTimeout> | undefined;
    let touchPinch: { ids: number[]; x: number; y: number } | null = null;
    let axis: PinchAxis | null = null;

    const clearPreview = () => {
      content.style.transform = "";
      content.style.transformOrigin = "";
      content.style.willChange = "";
      content.style.pointerEvents = "";
      container.removeAttribute("data-score-pinching");
    };
    clearPreviewRef.current = clearPreview;

    const begin = (clientX: number, clientY: number) => {
      if (base) return;
      base = { ...dimensions.current };
      pending = { ...base };
      activeRef.current = true;
      const rect = content.getBoundingClientRect();
      content.style.transformOrigin = `${clientX - rect.left}px ${
        clientY - rect.top
      }px`;
      content.style.willChange = "transform";
      content.style.pointerEvents = "none";
      container.setAttribute("data-score-pinching", "true");
    };

    const preview = (next: Dimensions) => {
      if (!base) return;
      pending = {
        secondWidth:
          axis === "horizontal"
            ? clamp(next.secondWidth, 2, 150)
            : base.secondWidth,
        noteHeight:
          axis === "vertical" ? clamp(next.noteHeight, 1, 10) : base.noteHeight,
      };
      content.style.transform = `scale(${
        pending.secondWidth / base.secondWidth
      }, ${pending.noteHeight / base.noteHeight})`;
    };

    const finish = (commit = true) => {
      clearTimeout(wheelTimer);
      touchPinch = null;
      axis = null;
      if (!base || !pending) return;
      const next = commit ? pending : base;
      base = null;
      pending = null;
      activeRef.current = false;
      unstable_batchedUpdates(() => {
        setSecondWidth(next.secondWidth);
        setNoteHeight(next.noteHeight);
        refreshScore();
      });
    };

    const onWheel = (event: WheelEvent) => {
      // Chrome exposes trackpad pinch as Ctrl+wheel, without a release event.
      if (!event.ctrlKey || touchPinch) return;
      event.preventDefault();
      begin(event.clientX, event.clientY);
      // Wheel pinch contains no finger orientation; Shift selects the vertical
      // axis at the start. Keep that axis even if Shift changes mid-gesture.
      if (!axis) axis = event.shiftKey ? "vertical" : "horizontal";
      const delta =
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
          ? container.clientHeight
          : 1);
      const scale = Math.exp(-clamp(delta, -100, 100) * 0.01);
      preview({
        secondWidth: pending.secondWidth * scale,
        noteHeight: pending.noteHeight * scale,
      });
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => finish(), 150);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) {
        finish();
        return;
      }
      event.preventDefault();
      finish();
      const [a, b] = Array.from(event.touches);
      begin((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
      touchPinch = {
        ids: [a.identifier, b.identifier],
        x: Math.abs(a.clientX - b.clientX),
        y: Math.abs(a.clientY - b.clientY),
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!touchPinch || !base || event.touches.length !== 2) return;
      event.preventDefault();
      const touches = Array.from(event.touches);
      const a = touches.find((touch) => touch.identifier === touchPinch.ids[0]);
      const b = touches.find((touch) => touch.identifier === touchPinch.ids[1]);
      if (!a || !b) return;
      const x = Math.abs(a.clientX - b.clientX);
      const y = Math.abs(a.clientY - b.clientY);
      if (!axis) {
        // Wait for a clear direction instead of letting jitter or a diagonal
        // start choose an axis. Once chosen it cannot change until release.
        const dx = touchPinch.x >= 24 ? Math.abs(x - touchPinch.x) : 0;
        const dy = touchPinch.y >= 24 ? Math.abs(y - touchPinch.y) : 0;
        if (Math.max(dx, dy) < 3) return;
        if (dx > dy * 1.5) axis = "horizontal";
        else if (dy > dx * 1.5) axis = "vertical";
        else return;
      }
      preview({
        secondWidth:
          base.secondWidth * (touchPinch.x >= 24 ? x / touchPinch.x : 1),
        noteHeight:
          base.noteHeight * (touchPinch.y >= 24 ? y / touchPinch.y : 1),
      });
    };
    const onTouchEnd = () => finish();
    const onTouchCancel = () => finish(false);
    const onBlur = () => finish();

    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);
    container.addEventListener("touchcancel", onTouchCancel);
    window.addEventListener("blur", onBlur);
    return () => {
      clearTimeout(wheelTimer);
      activeRef.current = false;
      clearPreview();
      clearPreviewRef.current = null;
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("blur", onBlur);
    };
  }, [containerRef, enabled, setNoteHeight, setSecondWidth]);

  return activeRef;
}
