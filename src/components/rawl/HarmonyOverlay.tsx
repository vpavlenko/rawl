import React, { createContext, useContext } from "react";
import "./HarmonyOverlay.css";
import { chordName, HarmonyResult, pitchName } from "../../harmony/harmony";
export const HarmonyContext = createContext<HarmonyResult | null>(null);

function HarmonyText({ children }: { children: string }) {
  return (
    <>
      {children.split(/([♭♯])/).map((part, i) =>
        part === "♭" || part === "♯" ? (
          <span className="harmony-accidental" key={i}>
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

const isUncertain = (chord: HarmonyResult["chords"][number]) =>
  chord.confidence < 0.6 || chord.keyConfidence < 0.6;

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
  const chords = result.chords.filter((c) => c.start < end && c.end > start);
  return (
    <div
      aria-label="Estimated harmony"
      style={{
        position: "relative",
        height: 24,
        marginBottom: 8,
        fontSize: 12,
        color: "#ddd",
      }}
    >
      {chords.map((chord, i) => {
        const left = secondsToX(Math.max(start, chord.start)),
          width = Math.max(1, secondsToX(Math.min(end, chord.end)) - left);
        const uncertain = isUncertain(chord);
        return (
          <button
            key={`chord-${i}`}
            className="harmony-chord"
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
              top: 0,
              width,
            }}
          >
            <strong className="harmony-roman">
              <HarmonyText>{chord.roman}</HarmonyText>
            </strong>
            <span className="harmony-name">
              <HarmonyText>
                {chordName(chord.root, chord.quality, chord.tonic)}
              </HarmonyText>
            </span>
          </button>
        );
      })}
    </div>
  );
}
