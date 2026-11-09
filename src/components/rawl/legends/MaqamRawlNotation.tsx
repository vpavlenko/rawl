import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { TonalGrid } from "../AnalysisGrid";
import { noteColorClass } from "../colors";
import { getNoteRectangles } from "../getNoteRectangles";
import { PlaybackSectionContext } from "../notePlayback";
import { ColoredNote } from "../parseMidi";
import { createMidiNumberToY } from "../noteCoordinates";
import NoteCentsTooltip from "../NoteCentsTooltip";
import { getPitchCentsFromTonic } from "../noteCents";
import { getHoverColorPitchClass, HoverTonicPreview } from "../hoverTonic";
import type { MidiRange } from "../SystemLayout";
import { maqamNoteSpan } from "./maqamPlayback";
import {
  getMaqamNotationLayout,
  MaqamNotationGroup,
} from "./maqamNotationLayout";

const ScrollArea = styled.div`
  max-width: 100%;
  overflow-x: auto;
`;

const Roll = styled.div`
  position: relative;
  width: 100%;

  [role="button"]:focus-visible {
    outline: 2px solid #e9b44c;
  }
`;

const Group = styled.div<{ $above: boolean }>`
  position: absolute;
  height: 4px;
  box-sizing: border-box;
  border: 1px solid #aaa;
  border-top: ${({ $above }) => ($above ? undefined : 0)};
  border-bottom: ${({ $above }) => ($above ? 0 : undefined)};
  color: #ccc;
  text-align: center;
  font-size: 10px;
  line-height: 10px;
  white-space: nowrap;

  > span {
    position: absolute;
    width: 100%;
    display: block;
    ${({ $above }) => ($above ? "bottom: 6px;" : "top: 6px;")}
  }
`;

export const MaqamRawlNotation: React.FC<{
  name: string;
  tonic: number;
  pitches: number[];
  startColumn: number;
  columnCount: number;
  minimumColumnWidth?: number;
  noteHeight: number;
  auxiliary?: boolean[];
  ghammaz?: number[];
  groups?: MaqamNotationGroup[];
  section: readonly [number, number];
  activeIndex: number | null;
  onNote: (pitch: number, index: number) => void;
}> = ({
  name,
  tonic,
  pitches,
  startColumn,
  columnCount,
  minimumColumnWidth = 26,
  noteHeight,
  auxiliary = [],
  ghammaz = [],
  groups = [],
  section,
  activeIndex,
  onNote,
}) => {
  const [hover, setHover] = useState<{
    cents: number;
    midi: number;
    shiftKey: boolean;
    x: number;
    y: number;
  } | null>(null);
  const [width, setWidth] = useState(0);
  const rollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const syncShift = (event: KeyboardEvent) => {
      if (event.key === "Shift")
        setHover((current) =>
          current ? { ...current, shiftKey: event.shiftKey } : null,
        );
    };
    const clear = () => setHover(null);
    window.addEventListener("keydown", syncShift);
    window.addEventListener("keyup", syncShift);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", syncShift);
      window.removeEventListener("keyup", syncShift);
      window.removeEventListener("blur", clear);
    };
  }, []);
  useLayoutEffect(() => {
    const element = rollRef.current;
    if (!element) return;
    const updateWidth = () => setWidth(element.clientWidth);
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const minimumWidth = columnCount * minimumColumnWidth;
  const drawingWidth = Math.max(minimumWidth, width);
  const base = 60 + tonic;
  const midiPitches = pitches.map((pitch) => base + pitch);
  const midiRange: MidiRange = [
    Math.min(base, ...midiPitches),
    Math.max(base, ...midiPitches),
  ];
  const layout = getMaqamNotationLayout(pitches, groups, noteHeight);
  const pitchedHeight =
    (midiRange[1] - midiRange[0] + 1) * noteHeight + layout.topPadding;
  const midiNumberToY = createMidiNumberToY(
    pitchedHeight,
    midiRange,
    noteHeight,
  );
  const secondsToX = (seconds: number) =>
    (seconds / columnCount) * drawingWidth;
  const tonicPreview: HoverTonicPreview | null = hover?.shiftKey
    ? { pitch: hover.midi, start: -Infinity, end: Infinity }
    : null;
  const notes: ColoredNote[] = pitches.map((pitch, index) => {
    const id = `${name}-${index}`;
    const note = {
      id,
      voiceIndex: 0,
      isDrum: false,
      note: { midiNumber: base + pitch },
      span: maqamNoteSpan(section, index),
    };
    const pitchClass =
      getHoverColorPitchClass(note, tonicPreview) ?? ((pitch % 12) + 12) % 12;
    return {
      ...note,
      displaySpan: [startColumn + index, startColumn + index + 1],
      color: noteColorClass(pitchClass),
      colorPitchClass: pitchClass,
      isActive: true,
    };
  });

  return (
    <ScrollArea>
      <Roll
        data-testid="maqam-rawl"
        data-preview-tonic={tonicPreview?.pitch}
        ref={rollRef}
        style={{
          height: layout.height,
          minWidth: minimumWidth,
        }}
      >
        <TonalGrid
          tonic={tonic}
          measures={[0, columnCount]}
          midiRange={midiRange}
          midiNumberToY={midiNumberToY}
          noteHeight={noteHeight}
          secondsToX={secondsToX}
        />
        <PlaybackSectionContext.Provider value={section}>
          {getNoteRectangles(
            notes,
            midiNumberToY,
            noteHeight,
            (note) => {
              const index = Number(note.id.slice(note.id.lastIndexOf("-") + 1));
              onNote(pitches[index], index);
            },
            (note, event) => {
              const cents = getPitchCentsFromTonic(note.note.midiNumber, tonic);
              if (event && cents !== null)
                setHover({
                  cents,
                  midi: note.note.midiNumber,
                  shiftKey: event.shiftKey,
                  x: event.clientX,
                  y: event.clientY,
                });
            },
            () => setHover(null),
            secondsToX,
            false,
            null,
            false,
            undefined,
            null,
            undefined,
            undefined,
            (note) => {
              const index = Number(note.id.slice(note.id.lastIndexOf("-") + 1));
              const pitch = pitches[index];
              return {
                role: "button",
                tabIndex: 0,
                "aria-label": `${name.toLowerCase()} ${pitch}`,
                "data-testid": "maqam-note",
                "data-pitch": pitch,
                "data-index": index,
                "data-auxiliary": auxiliary[index] || undefined,
                "data-ghammaz": ghammaz.includes(pitch) || undefined,
                "data-active": index === activeIndex || undefined,
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    event.nativeEvent.stopImmediatePropagation();
                    onNote(pitch, index);
                  }
                },
              };
            },
          )}
        </PlaybackSectionContext.Provider>
        {hover && (
          <NoteCentsTooltip
            cents={hover.cents}
            x={hover.x}
            y={hover.y}
            compact
          />
        )}
        {groups.map((group, index) => (
          <Group
            key={index}
            $above={!!group.above}
            data-testid="maqam-bracket"
            data-placement={group.above ? "above" : "below"}
            data-start={group.start}
            data-end={group.end}
            data-maqam-name={group.nameOnly || undefined}
            style={{
              border: group.nameOnly ? 0 : undefined,
              left: `${((startColumn + group.start) / columnCount) * 100}%`,
              width: `${((group.end - group.start + 1) / columnCount) * 100}%`,
              top: layout.groupTops[index],
            }}
          >
            <span>{group.label.toLowerCase()}</span>
          </Group>
        ))}
      </Roll>
    </ScrollArea>
  );
};
