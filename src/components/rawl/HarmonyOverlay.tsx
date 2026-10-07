import React, { createContext, useContext } from "react";
import {
  chordName,
  HarmonyResult,
  PITCH_NAMES,
  pitchName,
} from "../../harmony/harmony";
export const HarmonyContext = createContext<HarmonyResult | null>(null);
export default function HarmonyOverlay({
  start,
  end,
  secondsToX,
  seek,
}: {
  start: number;
  end: number;
  secondsToX: (seconds: number) => number;
  seek?: (ms: number) => void;
}) {
  const result = useContext(HarmonyContext);
  if (!result) return null;
  return (
    <div
      aria-label="Estimated harmony"
      style={{
        position: "relative",
        height: 64,
        marginBottom: 8,
        fontSize: 11,
        color: "#ddd",
      }}
    >
      {result.keys
        .filter((k) => k.start < end && k.end > start)
        .map((key, i) => (
          <div
            key={`key-${i}`}
            title={`${
              key.source === "reference" ? "Saved tonic" : "Estimated key"
            }; evidence ${key.confidence.toFixed(2)} (not a probability)`}
            style={{
              position: "absolute",
              left: secondsToX(Math.max(start, key.start)),
              top: 0,
              height: 17,
              maxWidth: Math.max(
                0,
                secondsToX(Math.min(end, key.end)) -
                  secondsToX(Math.max(start, key.start)),
              ),
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: key.source === "reference" ? "#d4d4d4" : "#ad9cdf",
              whiteSpace: "nowrap",
            }}
          >
            {key.source === "reference" ? "Tonic" : "Key ≈"}{" "}
            {PITCH_NAMES[key.tonic]}
            {key.source === "inferred" ? ` ${key.mode}` : ""}
          </div>
        ))}
      {result.chords
        .filter((c) => c.start < end && c.end > start)
        .map((chord, i) => {
          const left = secondsToX(Math.max(start, chord.start)),
            width = Math.max(1, secondsToX(Math.min(end, chord.end)) - left);
          const uncertain = chord.confidence < 0.6 || chord.keyConfidence < 0.6;
          return (
            <button
              key={`chord-${i}`}
              data-harmony-chord={chord.roman}
              aria-label={`${chord.roman}, ${chordName(
                chord.root,
                chord.quality,
                chord.tonic,
              )}, measure ${chord.measure}, evidence ${chord.confidence.toFixed(
                2,
              )}`}
              title={`${chord.roman} · ${chordName(
                chord.root,
                chord.quality,
                chord.tonic,
              )}${
                chord.bass != null && chord.bass !== chord.root
                  ? `/${pitchName(chord.bass, chord.tonic)}`
                  : ""
              }\nChord evidence ${chord.confidence.toFixed(
                2,
              )} · tonic evidence ${chord.keyConfidence.toFixed(2)}\n${
                uncertain ? "Uncertain estimate" : "Estimated harmony"
              }${
                chord.alternatives.length
                  ? `\nAlternatives: ${chord.alternatives.join(", ")}`
                  : ""
              }\nClick to seek`}
              onClick={() => seek?.(Math.max(0, chord.start * 1000))}
              style={{
                position: "absolute",
                left,
                top: 21,
                width,
                height: 31,
                padding: "2px 3px",
                textAlign: "left",
                boxSizing: "border-box",
                background: "transparent",
                border: `1px ${uncertain ? "dashed" : "solid"} ${
                  uncertain ? "#524b60" : "#8872b0"
                }`,
                color: uncertain ? "#aaa" : "#f0e9ff",
                overflow: "hidden",
                whiteSpace: "nowrap",
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              <strong>{chord.roman}</strong>{" "}
              <span style={{ color: "#aaa" }}>
                {chordName(chord.root, chord.quality, chord.tonic)}
              </span>
            </button>
          );
        })}
      {result.phrases
        .filter(
          (b) =>
            b.time >= start &&
            b.time < end &&
            !result.sections.some(
              (section) => section.measure > 1 && section.measure === b.measure,
            ),
        )
        .map((b) => (
          <span
            key={`phrase-${b.measure}`}
            title={`Suggested phrase · measure ${b.measure} · ${b.evidence}`}
            style={{
              position: "absolute",
              left: secondsToX(b.time),
              top: 53,
              color: "#777",
              fontSize: 9,
            }}
          >
            │ phrase
          </span>
        ))}
      {result.sections
        .filter((b) => b.measure > 1 && b.time >= start && b.time < end)
        .map((b) => (
          <span
            key={`section-${b.measure}`}
            title={`Suggested section · measure ${b.measure} · ${b.evidence}`}
            style={{
              position: "absolute",
              left: secondsToX(b.time),
              top: 53,
              color: "#c3a77a",
              fontSize: 9,
            }}
          >
            ┃ section
          </span>
        ))}
    </div>
  );
}
