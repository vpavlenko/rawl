import { FoldablePianoLegend as SharedFoldablePianoLegend } from "librawl/components";
import type { PianoLegendAudition, PianoLegendMode } from "librawl/components";
import "librawl/piano-legend.css";
import * as React from "react";
import styled, { css, keyframes } from "styled-components";
import { useLocalStorage } from "usehooks-ts";
import { playArpeggiatedChord, playScale } from "../../../sampler/sampler";
import { HEADER_HEIGHT } from "../../AppHeader";
import { PITCH_CLASS_TO_LETTER } from "../AnalysisGrid";
import { TOP_100_COMPOSERS } from "../top100Composers";
import {
  CHROMATIC_CHORDS,
  formatChordName,
  MAJOR_MODE,
  MINOR_MODE,
  Mode,
  rehydrateChords,
} from "./chords";
import { usesQanunTimbre } from "../corpora/corpora";
import MaqamLegend from "./MaqamLegend";

const MOBILE_PIANO_LEGEND_MEDIA_QUERY = "(max-width: 767px)";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const BLACK_KEY_LABELS = ["b2", "b3", -1, "#4", "b6", "b7", -1];

const KEY_WIDTH = 26;
const KEY_HEIGHT = 70;
const ROW_DISTANCE = 40;
const PADDING = 2.5;
const INLINE_KEY_WIDTH = 10;
const INLINE_KEY_HEIGHT = 24;
const INLINE_ROW_DISTANCE = 15;
const INLINE_PADDING = 2;

const keyPress = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
`;

const PianoKey = styled.div<{ isPlaying?: boolean; isEnabled?: boolean; $active?: boolean }>`
  position: absolute;
  user-select: none;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  vertical-align: bottom;
  color: white;
  text-shadow:
    0.5px 0.5px 0px black,
    -0.5px 0.5px 0px black,
    0.5px -0.5px 0px black,
    -0.5px -0.5px 0px black;
  display: grid;
  align-content: end;
  box-sizing: border-box;
  transform-origin: top;
  opacity: ${(props) => (props.isEnabled ? 1 : 0)};
  ${(props) => props.$active && css`
    transform: scale(1.2);
    z-index: 4 !important;
    opacity: 1;
  `}
  ${(props) =>
    props.isPlaying &&
    css`
      animation: ${keyPress} 0.2s ease-out;
    `}
`;

const isMobilePianoLegend = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(MOBILE_PIANO_LEGEND_MEDIA_QUERY).matches;

export const PianoLegend: React.FC<{
  currentTonic?: number;
  inline?: boolean;
  enabledPitches?: number[];
  activePitch?: number | null;
}> = ({
  currentTonic = 0,
  inline = false,
  activePitch = null,
  enabledPitches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
}) => {
  const [playingNotes, setPlayingNotes] = React.useState<Set<number>>(
    new Set(),
  );

  const playNote = (note: number) => {
    if (!inline && enabledPitches.includes(note)) {
      const transposedNote = note + currentTonic;
      playArpeggiatedChord([transposedNote], false);
      setPlayingNotes(new Set([...playingNotes, note]));
      setTimeout(() => {
        setPlayingNotes((prev) => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }, 200);
    }
  };

  const keyWidth = inline ? INLINE_KEY_WIDTH : KEY_WIDTH;
  const keyHeight = inline ? INLINE_KEY_HEIGHT : KEY_HEIGHT;
  const rowDistance = inline ? INLINE_ROW_DISTANCE : ROW_DISTANCE;
  const padding = inline ? INLINE_PADDING : PADDING;

  return (
    <div style={{ backgroundColor: "black", padding: "0", zIndex: 100000 }}>
      <div
        style={{
          position: "relative",
          width: WHITE_KEYS.length * (keyWidth + padding),
          height: keyHeight + rowDistance,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <React.Fragment key={i}>
            <PianoKey
              key={`w_${i}`}
              className={
                (inline || enabledPitches.includes(WHITE_KEYS[i])) &&
                `noteColor_${[WHITE_KEYS[i]]}_colors`
              }
              isEnabled={inline || enabledPitches.includes(WHITE_KEYS[i])}
              isPlaying={playingNotes.has(WHITE_KEYS[i])}
              $active={activePitch === WHITE_KEYS[i]}
              style={{
                top: rowDistance,
                left: (keyWidth + padding) * i,
                width: keyWidth,
                height: keyHeight,
                borderRadius: inline ? "3px" : "5px",
                cursor:
                  inline || enabledPitches.includes(WHITE_KEYS[i])
                    ? "pointer"
                    : "default",
              }}
              onClick={() => playNote(WHITE_KEYS[i])}
            >
              <div style={{ position: "relative" }}>
                {!inline && (
                  <>
                    {i === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "18px",
                          left: "2px",
                          color: "black",
                          fontWeight: "bold",
                          width: "0",
                          overflow: "visible",
                          textAlign: "center",
                          fontSize: "14px",
                          textShadow: "none",
                          zIndex: 3,
                        }}
                      >
                        {PITCH_CLASS_TO_LETTER[((currentTonic % 12) + 12) % 12]}
                      </span>
                    )}
                    {i + 1}
                  </>
                )}
              </div>
            </PianoKey>
            {BLACK_KEYS[i] !== -1 ? (
              <PianoKey
                key={`b_${i}`}
                className={
                  (inline || enabledPitches.includes(BLACK_KEYS[i])) &&
                  `noteColor_${[BLACK_KEYS[i]]}_colors`
                }
                isEnabled={inline || enabledPitches.includes(BLACK_KEYS[i])}
                isPlaying={playingNotes.has(BLACK_KEYS[i])}
                $active={activePitch === BLACK_KEYS[i]}
                style={{
                  top: 0,
                  left: (keyWidth + padding) * (i + 0.5),
                  zIndex: 2,
                  width: keyWidth,
                  height: keyHeight,
                  borderRadius: inline ? "3px" : "5px",
                  cursor:
                    inline || enabledPitches.includes(BLACK_KEYS[i])
                      ? "pointer"
                      : "default",
                  backgroundColor:
                    inline || enabledPitches.includes(BLACK_KEYS[i])
                      ? undefined
                      : "black",
                }}
                onClick={() => playNote(BLACK_KEYS[i])}
              >
                {!inline &&
                  BLACK_KEY_LABELS[i]
                    .toString()
                    .replace("b", "♭")
                    .replace("#", "♯")}
              </PianoKey>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const InlinePianoLegend: React.FC<{ enabledPitches?: number[] }> = ({
  enabledPitches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
}) => {
  return <PianoLegend inline enabledPitches={enabledPitches} />;
};

/** Keep the legacy chapter filtering and sampler register for the shared rows. */
function prepareLegendModes(mode: Mode | Mode[] | undefined, chapterChords?: string[]): PianoLegendMode[] {
  const primary = Array.isArray(mode) ? mode : mode ? [mode] : [MAJOR_MODE, MINOR_MODE];
  const rows = chapterChords ? [...primary, CHROMATIC_CHORDS] : primary;
  const available = chapterChords && new Set(chapterChords);
  return rows.flatMap(({ title, chords }) => {
    const filtered = available ? chords.filter(chord => available.has(chord)) : chords;
    if (!filtered.length || (available && !filtered.some(chord => chord !== "V" && chord !== "V7"))) {
      return [];
    }
    const voiced = rehydrateChords(filtered);
    const lowest = voiced.reduce((chord, candidate) =>
      candidate.positions[0] < chord.positions[0] ? candidate : chord,
    );
    const shift = lowest.pitches[0] - lowest.positions[0];
    return [{
      title,
      chords: voiced.map(({ name, pitches, positions }) => ({
        name,
        pitches,
        positions: positions.map(position => position + shift),
        romanLabel: formatChordName(name),
      })),
    }];
  });
}

const audition: PianoLegendAudition = (pitches, { kind, onActiveNote }) => {
  if (kind === "scale") {
    return playScale(pitches, index => onActiveNote?.(index));
  }
  void playArpeggiatedChord(pitches, kind === "chord");
};

function FoldableMaqamLegend() {
  const [expanded, setExpanded] = useLocalStorage(
    isMobilePianoLegend() ? "showLegendMobile" : "showLegend",
    false,
  );
  return <MaqamLegend expanded={expanded} onExpandedChange={setExpanded} />;
}

const LegendPlacement = styled.div`
  display: contents;
  --rawl-piano-legend-z-index: 100000;

  .rawln-piano-legend {
    --rawln-legend-top: calc(${() => HEADER_HEIGHT} + 8px + env(safe-area-inset-top, 0px));
  }
`;

export const FoldablePianoLegend: React.FC<{
  slug?: string;
  mode?: Mode | Mode[];
  currentTonic?: number;
  setHoveredColors?: (colors: string[] | null) => void;
}> = ({ slug, mode, currentTonic, setHoveredColors }) => {
  const chapterChords = TOP_100_COMPOSERS.find(composer => composer.slug === slug)?.chords;
  const modes = React.useMemo(() => prepareLegendModes(mode, chapterChords), [mode, chapterChords]);
  if (usesQanunTimbre(slug)) return <FoldableMaqamLegend key={slug} />;
  return (
    <LegendPlacement>
      <SharedFoldablePianoLegend
        currentTonic={currentTonic}
        modes={modes}
        onAudition={audition}
        setHoveredColors={setHoveredColors}
      />
    </LegendPlacement>
  );
};
