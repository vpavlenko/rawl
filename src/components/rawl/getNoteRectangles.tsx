import { pitchColor as paletteColor } from "./colors";
import * as React from "react";
import { SecondsConverter, SecondsSpan } from "./Rawl";
import { ColoredNote, Note, PitchBendPoint } from "./parseMidi";
import { DrumPlaybackContext } from "./drumPlayback";
import { NotePlaybackContext, PlaybackSectionContext } from "./notePlayback";
import { VoiceZIndicesContext } from "./voiceOrder";
import { StrumNotesContext } from "./strumContext";

// Also useful emojis
// 🤯 🎯 🪤 💣 🔫 💢

// https://www.stevenestrella.com/midi/gmdrums.gif
const GM_DRUM_KIT = {
  28: "🤜",
  31: "🕒", //"Metronome Click",
  35: "🦵", //"Acoustic Bass Drum",
  36: "🦶🏼", //"Bass Drum 1",
  37: "🏑", //"Side Stick",
  38: "🥁", //"Acoustic Snare",
  39: "👏", //"Hand Clap",
  40: "⚡", //"Electric Snare",
  41: "0️⃣", //"Low Floor Tom",
  42: "🔒", // "Closed Hi Hat",
  43: "1️⃣", //"High Floor Tom",
  44: "🚴‍♀️", //"Pedal Hi-Hat",
  45: "2️⃣", //"Low Tom",
  46: "💿", //"Open Hi-Hat",
  47: "3️⃣", // "Low-Mid Tom",
  48: "4️⃣", //"Hi-Mid Tom",
  49: "💥", //"Crash Cymbal 1",
  50: "5️⃣", //"High Tom",
  51: "🚗", //"Ride Cymbal 1",
  52: "🇨🇳", //"Chinese Cymbal",
  53: "🛎️", //"Ride Bell",
  54: "⏰", //"Tambourine",
  55: "💦", //"Splash Cymbal",
  56: "🐄",
  57: "🔥", //"Crash Cymbal 2",
  58: "📳",
  59: "🚙", //"Ride Cymbal 2",
  60: "🔼",
  61: "🔽",
  62: "🕺",
  63: "💃",
  64: "🪘",
  65: "⬆️",
  66: "⬇️",
  67: "🗼",
  68: "🍦",
  69: "🍡",
  70: "🎉",
  71: "🐦",
  72: "💨",
  73: "#️⃣",
  74: "📶",
  75: "🔑",
  76: "🪵",
  77: "🌳",
  78: "🐭",
  79: "🇧🇷",
  80: "⨻",
  81: "△",
  82: "⚱️", //'Shaker',
  83: "🎅🏻", //"Jingle Bell",
  84: "🚿",
  85: "🌰",
  86: "🍺",
  87: "🛢️",
};

type MouseEventHanlder = (note: Note) => void;

const DrumEmoji: React.FC<{
  isPlayingNow?: boolean;
  collapsed: boolean;
  startSeconds: number;
  size: number;
  left: number;
  top: number;
  zIndex?: number;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}> = ({ isPlayingNow, collapsed, startSeconds, size, left, top, zIndex, onClick, children }) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const animationRef = React.useRef<Animation | null>(null);
  const registerDrum = React.useContext(DrumPlaybackContext);
  const section = React.useContext(PlaybackSectionContext);

  const pulse = React.useCallback(() => {
    if (!elementRef.current || collapsed) return;
    animationRef.current?.cancel();
    // Apply the maximum size before paint, then release around the resting center.
    // Let the pulse finish even when the MIDI hit is shorter than 1 second.
    animationRef.current = elementRef.current.animate(
      [
        {
          fontSize: `${size * 4}px`,
          width: `${size * 4}px`,
          height: `${size * 4}px`,
          top: `${top - (size * 3) / 2}px`,
        },
        {
          fontSize: `${size}px`,
          width: `${size}px`,
          height: `${size}px`,
          top: `${top}px`,
        },
      ],
      { duration: 1000, easing: "ease-out", fill: "backwards" },
    );
  }, [size, top, collapsed]);

  React.useLayoutEffect(() => {
    // Stop an in-flight pulse before painting the collapsed timing mark.
    if (collapsed) animationRef.current?.cancel();
  }, [collapsed]);

  React.useLayoutEffect(() => {
    if (registerDrum && (!section || (startSeconds >= section[0] && startSeconds < section[1]))) {
      return registerDrum(startSeconds, pulse);
    }
  }, [registerDrum, startSeconds, pulse, section]);

  React.useLayoutEffect(() => {
    if (!registerDrum && isPlayingNow) pulse();
  }, [registerDrum, isPlayingNow, pulse]);

  React.useEffect(() => () => animationRef.current?.cancel(), []);

  return (
    <div
      ref={elementRef}
      onClick={onClick}
      style={{
        position: "absolute",
        fontSize: collapsed ? 0 : size,
        height: collapsed ? 1 : size,
        width: size,
        lineHeight: 1,
        overflow: "visible",
        left,
        top: collapsed ? top + size / 2 : top,
        backgroundColor: collapsed ? "#888" : undefined,
        pointerEvents: onClick ? "auto" : "none",
        cursor: onClick ? "e-resize" : undefined,
        fontFamily: "Helvetica, sans-serif",
        color: "white",
        transform: "translateX(-50%)",
        transition: "none",
        whiteSpace: "nowrap",
        zIndex: zIndex ?? (collapsed ? 10 : 1000),
      }}
    >
      {children}
    </div>
  );
};

export type MouseHandlers = {
  handleNoteClick: MouseEventHanlder | null;
  handleMouseEnter: MouseEventHanlder;
  handleMouseLeave: () => void;
  hoveredNote: Note | null;
  systemClickHandler: (
    e: React.MouseEvent,
    xToSeconds?: (number) => number,
  ) => void;
};

let nextPitchBendGradientId = 0;

const pitchBendToSemitones = (value: number) =>
  ((Math.max(0, Math.min(16383, value)) - 8192) / 8192) * 2;

const pitchColor = (pitch: number) => {
  const lower = Math.floor(pitch);
  const fraction = pitch - lower;
  const color = paletteColor;
  return fraction === 0
    ? color(lower)
    : `color-mix(in srgb, ${color(lower)} ${(1 - fraction) * 100}%, ${color(
        lower + 1,
      )})`;
};

const PitchBendNote: React.FC<{
  points: PitchBendPoint[];
  span: SecondsSpan;
  height: number;
  width: number;
  secondsToX: SecondsConverter;
  pitchToOffset: (semitones: number) => number;
  colorPitchClass: ColoredNote["colorPitchClass"];
  outlined: boolean;
  interactive: boolean;
}> = ({
  points,
  span,
  height,
  width,
  secondsToX,
  pitchToOffset,
  colorPitchClass,
  outlined,
  interactive,
}) => {
  const [gradientId] = React.useState(
    () => `pitch-bend-gradient-${nextPitchBendGradientId++}`,
  );
  const startX = secondsToX(span[0]);
  const samples = points
    .filter(
      (point) => Number.isFinite(point.time) && Number.isFinite(point.value),
    )
    .map((point) => ({
      x: Math.max(0, Math.min(width, secondsToX(point.time) - startX)),
      bend: pitchBendToSemitones(point.value),
    }))
    .sort((a, b) => a.x - b.x);
  if (!samples.length || width <= 0) return null;

  // Cover the entire note, including time before/after the bend events.
  if (samples[0].x > 0) samples.unshift({ x: 0, bend: 0 });
  samples.push({ x: width, bend: samples[samples.length - 1].bend });
  const edge = (sample: (typeof samples)[number], bottom: boolean) =>
    `${sample.x} ${pitchToOffset(sample.bend) + (bottom ? height : 0)}`;
  const path = `M ${samples
    .map((sample) => edge(sample, false))
    .join(" L ")} L ${[...samples]
    .reverse()
    .map((sample) => edge(sample, true))
    .join(" L ")} Z`;

  // Add a stop at every crossed semitone so large bends visit all palette anchors.
  const stops: { x: number; pitch: number }[] = [];
  const basePitch = typeof colorPitchClass === "number" ? colorPitchClass : 0;
  samples.forEach((sample, index) => {
    const pitch = basePitch + sample.bend;
    if (index > 0) {
      const previous = samples[index - 1];
      const previousPitch = basePitch + previous.bend;
      const crossings: { x: number; pitch: number }[] = [];
      for (
        let anchor = Math.floor(Math.min(previousPitch, pitch)) + 1;
        anchor < Math.max(previousPitch, pitch);
        anchor++
      ) {
        crossings.push({
          x:
            previous.x +
            (sample.x - previous.x) *
              ((anchor - previousPitch) / (pitch - previousPitch)),
          pitch: anchor,
        });
      }
      if (pitch < previousPitch) crossings.reverse();
      stops.push(...crossings);
    }
    stops.push({ x: sample.x, pitch });
  });

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={0}
          x2={width}
          y2={0}
          colorInterpolation="sRGB"
        >
          {stops.map((stop, index) => (
            <stop
              key={index}
              offset={stop.x / width}
              stopColor={
                typeof colorPitchClass === "number"
                  ? pitchColor(stop.pitch)
                  : "white"
              }
            />
          ))}
        </linearGradient>
      </defs>
      <path
        d={path}
        fill={`url(#${gradientId})`}
        stroke={outlined ? "black" : "none"}
        strokeWidth={0.5}
        strokeLinejoin="round"
        style={{ pointerEvents: interactive ? "visiblePainted" : "none" }}
      />
    </svg>
  );
};

export const getNoteRectangles = (
  notes: ColoredNote[],
  midiNumberToY: (number: number) => number,
  noteHeight: number,
  handleNoteClick: MouseEventHanlder,
  handleMouseEnter: MouseEventHanlder,
  handleMouseLeave: () => void,
  secondsToX: SecondsConverter,
  enableManualRemeasuring: boolean,
  hoveredColors: string[] | null,
  showSourceLocation: boolean = false,
  drumNoteToY?: (note: Note) => number,
  hoveredVoiceIndex: number | null = null,
  sectionEndX?: number,
  sectionStartX?: number,
) => {
  return notes.map((note) => (
    <NoteRectangle
      key={`nr_${note.id}`}
      note={note}
      midiNumberToY={midiNumberToY}
      noteHeight={noteHeight}
      handleNoteClick={handleNoteClick}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
      secondsToX={secondsToX}
      enableManualRemeasuring={enableManualRemeasuring}
      hoveredColors={hoveredColors}
      showSourceLocation={showSourceLocation}
      drumNoteToY={drumNoteToY}
      hoveredVoiceIndex={hoveredVoiceIndex}
      sectionEndX={sectionEndX}
      sectionStartX={sectionStartX}
    />
  ));
};

const NoteRectangle = React.memo(({
  note,
  midiNumberToY,
  noteHeight,
  handleNoteClick,
  handleMouseEnter,
  handleMouseLeave,
  secondsToX,
  enableManualRemeasuring,
  hoveredColors,
  showSourceLocation,
  drumNoteToY,
  hoveredVoiceIndex,
  sectionEndX,
  sectionStartX,
}: {
  note: ColoredNote;
  midiNumberToY: (number: number) => number;
  noteHeight: number;
  handleNoteClick: MouseEventHanlder | null;
  handleMouseEnter: MouseEventHanlder;
  handleMouseLeave: () => void;
  secondsToX: SecondsConverter;
  enableManualRemeasuring: boolean;
  hoveredColors: string[] | null;
  showSourceLocation: boolean;
  drumNoteToY?: (note: Note) => number;
  hoveredVoiceIndex: number | null;
  sectionEndX?: number;
  sectionStartX?: number;
}) => {
  const registerNote = React.useContext(NotePlaybackContext);
  const section = React.useContext(PlaybackSectionContext);
  const voiceZIndices = React.useContext(VoiceZIndicesContext);
  const strumNotes = React.useContext(StrumNotesContext);
  const isStrumNote = !note.isDrum && strumNotes.has(note.id);
  const voiceZIndex = voiceZIndices.get(note.voiceIndex);
  const [playing, setPlaying] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const playingRef = React.useRef(false);
  const bendPlayingRef = React.useRef(false);
  const geometryRef = React.useRef<{
    showFullNote: boolean; noteUnderCursor: boolean; baseHeight: number;
    baseTop: number; collapsedHeight: number; hasPitchBend: boolean;
  } | null>(null);
  const updatePlaying = React.useCallback((active: boolean) => {
    playingRef.current = active;
    const geometry = geometryRef.current;
    if (!geometry) return;
    if (geometry.hasPitchBend) {
      // Bent notes have an SVG path whose shape depends on the active height.
      // Track queued state too: a seek can clear/reapply within one React batch.
      if (bendPlayingRef.current !== active) {
        bendPlayingRef.current = active;
        setPlaying(active);
      }
      return;
    }
    const element = elementRef.current;
    if (!element) return;
    const { showFullNote, noteUnderCursor, baseHeight, baseTop, collapsedHeight } = geometry;
    const height = showFullNote
      ? baseHeight * (active || noteUnderCursor ? 2 : 1)
      : collapsedHeight;
    element.style.height = `${height}px`;
    element.style.top = `${showFullNote ? baseTop - (height - baseHeight) : baseTop + baseHeight - height}px`;
  }, []);
  const isPlayingNow =
    registerNote && !note.isDrum ? playing : note.isPlayingNow;
  const {
    isDrum,
    note: { midiNumber, relativeNumber },
    color,
    voiceIndex,
    isActive,
    sourceLocation,
    noteUnderCursor,
  } = note;
  const number = relativeNumber === undefined ? midiNumber : relativeNumber;

  // Calculate base height and top position
  // Keep the original bottom/pitch anchor; both React and imperative playback
  // geometry use this base height, including the pitch-bend ribbon.
  const heightScale = isStrumNote ? 0.5 : 1;
  const baseHeight = noteHeight * 2 * heightScale;
  const baseTop =
    (isDrum && drumNoteToY
      ? drumNoteToY(note)
      : midiNumberToY(isDrum ? number + 12 : number)) -
    noteHeight +
    noteHeight * 2 * (1 - heightScale);

  const left = secondsToX(note.span[0]);
  const width = secondsToX(note.span[1]) - secondsToX(note.span[0]);
  const shortNotePriority = Math.round(width > 0 ? 1000 / width : 1000);
  // Keep shorter notes above longer notes within their voice's 1,000-layer
  // band. Strum notes remain above the grid (1–4), below all regular notes.
  const noteZIndex = isStrumNote
    ? 5
    : voiceZIndex !== undefined
    ? voiceZIndex + Math.min(999, shortNotePriority)
    : undefined;

  const isOtherVoice =
    hoveredVoiceIndex !== null && voiceIndex !== hoveredVoiceIndex;
  const isHighlighted =
    !isOtherVoice &&
    (isDrum || !hoveredColors || hoveredColors.includes(color));
  const showFullNote =
    voiceIndex === hoveredVoiceIndex || (isActive && isHighlighted);
  const collapsedHeight = (isOtherVoice ? 1 : 0.5) * heightScale;

  // Adjust height and top position for notes under the cursor
  const activeHeight = isPlayingNow ? baseHeight * 2 : baseHeight;
  const height = showFullNote
    ? noteUnderCursor
      ? baseHeight * 2
      : activeHeight
    : collapsedHeight;
  const top = showFullNote
    ? noteUnderCursor
      ? baseTop - baseHeight
      : baseTop - (activeHeight - baseHeight)
    : baseTop + baseHeight - collapsedHeight;

  const hasPitchBend =
    !isDrum &&
    width > 0 &&
    note.pitchBend?.some(
      (point) =>
        Number.isFinite(point.time) &&
        Number.isFinite(point.value) &&
        point.value !== 8192,
    );

  geometryRef.current = {
    showFullNote, noteUnderCursor: !!noteUnderCursor, baseHeight, baseTop,
    collapsedHeight, hasPitchBend: !!hasPitchBend,
  };
  React.useLayoutEffect(() => {
    if (registerNote && !note.isDrum) {
      return registerNote(note.span[0], note.span[1], updatePlaying, section);
    }
  }, [registerNote, note.isDrum, note.span[0], note.span[1], section, updatePlaying]);
  React.useLayoutEffect(() => {
    // Reapply after layout/hover changes, without rebuilding playback indexes.
    if (registerNote && !note.isDrum) updatePlaying(playingRef.current);
  });

  // Keep a short continuation on either side of the section, without changing note timing
  // or compressing the pitch-bend curve into the visible portion.
  const continuationLength = 30;
  const fadeInEnd =
    !isDrum && sectionStartX !== undefined && left < sectionStartX
      ? sectionStartX - left
      : undefined;
  const fadeStart =
    !isDrum && sectionEndX !== undefined && left + width > sectionEndX
      ? sectionEndX - left
      : undefined;
  const maskStops = [
    ...(fadeInEnd !== undefined
      ? [`transparent ${fadeInEnd - continuationLength}px`, `black ${fadeInEnd}px`]
      : []),
    ...(fadeStart !== undefined
      ? [`black ${fadeStart}px`, `transparent ${fadeStart + continuationLength}px`]
      : []),
  ];
  const continuationMask = maskStops.length
    ? `linear-gradient(to right, ${maskStops.join(", ")})`
    : undefined;
  const clipLeft = fadeInEnd !== undefined
    ? Math.max(0, fadeInEnd - continuationLength)
    : -1;
  const clipRight = fadeStart !== undefined
    ? Math.max(0, width - fadeStart - continuationLength)
    : -1;
  const maskPadding = hasPitchBend ? noteHeight * 2 + 1 : 1;

  // Format source location string if it exists
  let sourceLocationText = "";
  if (sourceLocation) {
    // Format the command type (i for insert, c for copy, ac for all-channels copy)
    const commandType =
      sourceLocation.command === "insert"
        ? "i"
        : sourceLocation.command === "copy"
        ? "c"
        : sourceLocation.command === "ac"
        ? "ac"
        : "";

    if (commandType && sourceLocation.row && sourceLocation.col) {
      sourceLocationText = `${commandType} ${sourceLocation.row},${sourceLocation.col}`;
    }
  }

  return isDrum ? (
    isActive || voiceIndex === hoveredVoiceIndex ? (
      <DrumEmoji
        key={`nr_${note.id}`}
        collapsed={!showFullNote}
        isPlayingNow={isPlayingNow}
        startSeconds={note.span[0]}
        size={baseHeight * 1.5}
        left={left}
        top={baseTop - noteHeight / 2}
        zIndex={noteZIndex}
        onClick={
          enableManualRemeasuring && handleNoteClick
            ? (e) => {
                e.stopPropagation();
                handleNoteClick(note);
              }
            : undefined
        }
      >
        {GM_DRUM_KIT[midiNumber] || midiNumber}
      </DrumEmoji>
    ) : null
  ) : (
    <div
      ref={elementRef}
      key={`nr_${note.id}`}
      className={`${
        hasPitchBend ? "pitch-bend-note" : color
      } voiceShape-${voiceIndex} ${
        noteUnderCursor ? "note-under-cursor" : ""
      }`}
      style={{
        position: "absolute",
        height: `${height}px`,
        width,
        overflow: "visible",
        top,
        left,
        maskImage: continuationMask,
        WebkitMaskImage: continuationMask,
        maskSize: `100% calc(100% + ${maskPadding * 2}px)`,
        WebkitMaskSize: `100% calc(100% + ${maskPadding * 2}px)`,
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskClip: "no-clip",
        WebkitMaskClip: "no-clip",
        clipPath:
          fadeInEnd !== undefined || fadeStart !== undefined
            ? `inset(-${maskPadding}px ${clipRight}px -${maskPadding}px ${clipLeft}px)`
            : undefined,
        pointerEvents: handleNoteClick && !hasPitchBend ? "auto" : "none",
        zIndex:
          noteZIndex ??
          (10 + shortNotePriority +
            (noteUnderCursor ? 100 : 0)),
        boxSizing: "border-box",
        display: "grid",
        boxShadow: showFullNote && !hasPitchBend ? "0 0 0px 0.5px black" : "",
        cursor: enableManualRemeasuring
          ? "e-resize"
          : handleNoteClick
          ? "pointer"
          : "default",
        opacity: noteUnderCursor ? 1 : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (handleNoteClick) {
          handleNoteClick(note);
        }
      }}
      onMouseEnter={(e) => !isDrum && handleMouseEnter(note)}
      onMouseLeave={() => !isDrum && handleMouseLeave()}
    >
      {hasPitchBend && (
        <PitchBendNote
          points={note.pitchBend!}
          span={note.span}
          height={height}
          width={width}
          secondsToX={secondsToX}
          pitchToOffset={(bend) =>
            midiNumberToY(number + bend) - midiNumberToY(number)
          }
          colorPitchClass={note.colorPitchClass}
          outlined={showFullNote}
          interactive={!!handleNoteClick}
        />
      )}
      {showSourceLocation && sourceLocationText && showFullNote && (
        <div
          style={{
            position: "absolute",
            top: "-16px",
            left: 0,
            color: "white",
            fontSize: "10px",
            whiteSpace: "nowrap",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: "1px 3px",
            borderRadius: "2px",
            pointerEvents: "none",
          }}
        >
          {sourceLocationText}
        </div>
      )}
    </div>
  );
});
