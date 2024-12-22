import * as React from "react";
import { SecondsConverter, SecondsSpan } from "./Rawl";
import { ColoredNote, Note, PitchBendPoint } from "./parseMidi";

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

const convertPitchBendToPathData = (
  pitchBendData: PitchBendPoint[],
  span: SecondsSpan,
  noteHeight: number,
  secondsToX: SecondsConverter,
): string => {
  const pitchBendRange = 8192;
  const noteDuration = span[1] - span[0];
  const noteStartX = secondsToX(span[0]);

  const pitchBendToY = (value) => {
    const normalizedValue = (value + pitchBendRange) / (2 * pitchBendRange); // Normalize to 0-1
    return noteHeight * (1 - normalizedValue) * 4 + noteHeight / 2; // Invert because SVG's Y increases downwards
  };

  // Map a time value to the SVG's X coordinate, relative to the note's duration
  const timeToX = (time) => {
    const relativeTime = time - span[0]; // Time relative to the note's start
    const normalizedTime = relativeTime / noteDuration; // Normalize to 0-1
    return normalizedTime * (secondsToX(span[1]) - noteStartX); // Scale to note's width
  };

  // Start the path data string at the first pitch bend point
  let pathData = `M ${timeToX(pitchBendData[0].time)} ${pitchBendToY(
    pitchBendData[0].value,
  )}`;

  // Add line segments to each subsequent pitch bend point
  pitchBendData.forEach((point, index) => {
    if (index > 0) {
      // Skip the first point as it's already used in 'M'
      pathData += ` L ${timeToX(point.time)} ${pitchBendToY(point.value)}`;
    }
  });

  return pathData;
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
) => {
  return notes.map((note) => {
    const {
      isDrum,
      note: { midiNumber, relativeNumber },
      color,
      voiceIndex,
      isActive,
    } = note;
    const number = relativeNumber === undefined ? midiNumber : relativeNumber;
    const top = midiNumberToY(isDrum ? number + 12 : number) - noteHeight;
    const left = secondsToX(note.span[0]);

    const pathData = note.chipState?.on?.pitchBend
      ? convertPitchBendToPathData(
          note.chipState.on.pitchBend,
          note.span,
          noteHeight,
          secondsToX,
        )
      : null;
    const width = secondsToX(note.span[1]) - secondsToX(note.span[0]);

    return isDrum ? (
      isActive && (
        <div
          style={{
            position: "absolute",
            fontSize: "16px",
            height: "10px",
            width: "auto",
            overflow: "visible",
            left,
            top,
            fontFamily: "Helvetica, sans-serif",
            color: "white",
            placeItems: "center",
            transform: "translateX(-50%)", // Shift the div left by half its width
            whiteSpace: "nowrap", // Prevent text wrapping
            zIndex: 1000,
          }}
        >
          {GM_DRUM_KIT[midiNumber] || midiNumber}
        </div>
      )
    ) : (
      <div
        key={`nr_${note.id}`}
        className={`${color} voiceShape-${voiceIndex}`}
        style={{
          position: "absolute",
          height: `${isActive ? noteHeight * 2 : 0.5}px`,
          width,
          overflow: "visible",
          top: isActive ? top : top + noteHeight * 2 - 0.5,
          left,
          pointerEvents: handleNoteClick ? "auto" : "none",
          zIndex: Math.round(10 + (width > 0 ? 1000 / width : 1000)),
          boxSizing: "border-box",
          display: "grid",
          boxShadow: isActive ? "0 0 0px 0.5px black" : "",
          cursor: enableManualRemeasuring
            ? "e-resize"
            : handleNoteClick
            ? "pointer"
            : "default",
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
        {pathData && isActive && (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                overflow: "visible",
              }}
            >
              <path d={pathData} stroke="white" strokeWidth="4" fill="none" />
              <path d={pathData} stroke="black" strokeWidth="2" fill="none" />
            </svg>
          </div>
        )}
      </div>
    );
  });
};
