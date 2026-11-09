import * as React from "react";
import { createPortal } from "react-dom";

export default function NoteCentsTooltip({ cents, x, y }: {
  cents: number; x: number; y: number;
}) {
  return createPortal(
    <div
      role="tooltip"
      style={{
        position: "fixed",
        left: Math.max(4, Math.min(x + 12, window.innerWidth - 76)),
        top: Math.max(4, Math.min(y + 12, window.innerHeight - 32)),
        zIndex: 100000001,
        pointerEvents: "none",
        padding: "4px 7px",
        border: "1px solid #666",
        borderRadius: 4,
        background: "#111",
        color: "white",
        fontSize: 13,
        lineHeight: "18px",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      {(cents / 100).toFixed(2)}
    </div>,
    document.body,
  );
}
