import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { createTheme } from "@uiw/codemirror-themes";
import { getScaleMapForMode, KeySignature, NOTE_LETTER_MAP } from "./types";

// Types for the new architecture
interface ParsedNote {
  pitch: string;
  accidental?: "b" | "#";
  duration?: string;
  position: {
    start: number;
    end: number;
    durationStart?: number; // Optional to indicate if this note is part of a chord
  };
  degree: number;
  isPartOfChord?: boolean;
}

interface NoteColor {
  colorIndex: number;
  dotClass: string;
}

// Function to get background colors for each character in a line
export const getBackgroundsForLine = (
  line: string,
  currentKey: KeySignature,
  allLines: string[],
  lineIndex: number,
) => {
  // Get the base decorations first (for backgrounds)
  let baseDecorations = Array.from(line).map(() => ({ class: null }));

  // Process key signature and note colors first
  if (
    line.match(
      /^([A-G][b#]?)\s+(major|minor|lydian|mixolydian|dorian|phrygian)$/i,
    )
  ) {
    baseDecorations = processKeySignature(line, currentKey);
  } else if (line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/)) {
    baseDecorations = processNoteColors(line, currentKey, allLines, lineIndex);
  }

  // Then handle comments, preserving any background colors
  // Check if any previous line is just '%'
  for (let i = 0; i < lineIndex; i++) {
    if (allLines[i].trim() === "%") {
      return baseDecorations.map((decoration) => ({
        class: decoration.class ? `${decoration.class} comment` : "comment",
      }));
    }
  }

  // Check for comments in current line
  const commentIndex = line.indexOf("%");
  if (commentIndex !== -1) {
    return baseDecorations.map((decoration, index) => ({
      class:
        index >= commentIndex
          ? decoration.class
            ? `${decoration.class} comment`
            : "comment"
          : decoration.class,
    }));
  }

  return baseDecorations;
};

// Helper function to process key signature styling
const processKeySignature = (line: string, currentKey: KeySignature) => {
  const [_, root, mode] = line.match(
    /^([A-G][b#]?)\s+(major|minor|lydian|mixolydian|dorian|phrygian)$/i,
  )!;
  const modeStartIndex = line.toLowerCase().indexOf(mode.toLowerCase());
  const scaleMap = getScaleMapForMode(
    mode.toLowerCase() as KeySignature["mode"],
  );
  const UNSTABLE_PITCHES = [1, 2, 3, 5, 6];

  return Array.from(line).map((char, index) => {
    if (index >= modeStartIndex && index < modeStartIndex + mode.length) {
      const letterIndex = index - modeStartIndex;
      const unstablePitch = UNSTABLE_PITCHES[letterIndex];
      const colorIndex = scaleMap[unstablePitch];
      return { class: `noteColor_${colorIndex}_colors` };
    }
    return { class: null };
  });
};

// Parse a single note from a position in the melody string
const parseNote = (
  melody: string,
  startIndex: number,
  isPartOfChord: boolean = false,
): { note: ParsedNote | null; nextIndex: number; hasDuration: boolean } => {
  let i = startIndex;

  // Skip any whitespace
  while (i < melody.length && /\s/.test(melody[i])) i++;
  if (i >= melody.length)
    return { note: null, nextIndex: i, hasDuration: false };

  const noteStart = i;

  // Check for accidental
  let accidental: "b" | "#" | undefined;
  if (melody[i] === "b" || melody[i] === "#") {
    accidental = melody[i] as "b" | "#";
    i++;
  }

  // Get pitch
  if (i >= melody.length)
    return { note: null, nextIndex: i, hasDuration: false };
  const pitch = melody[i];
  const degree = NOTE_LETTER_MAP[pitch.toLowerCase()];
  if (degree === undefined)
    return { note: null, nextIndex: startIndex + 1, hasDuration: false };
  i++;

  // Look for duration
  let duration = "";
  let durationStart: number | undefined;
  let hasDuration = false;

  while (i < melody.length) {
    // Check for duration marker
    if (/[+_\-=,]/.test(melody[i])) {
      hasDuration = true;
      if (!isPartOfChord) {
        durationStart = i;
        duration += melody[i];
        i++;
        // Check for dot or triplet
        if (i < melody.length && (melody[i] === "." || melody[i] === ":")) {
          duration += melody[i];
          i++;
        }
      }
      break;
    }
    // If we see another note or accidental, stop
    if (/[a-zA-Z1-90x]|[b#]/.test(melody[i])) {
      break;
    }
    i++;
  }

  const note: ParsedNote = {
    pitch,
    accidental,
    duration: duration || undefined,
    position: {
      start: noteStart,
      end: durationStart || i,
      durationStart,
    },
    degree,
    isPartOfChord,
  };

  return { note, nextIndex: i, hasDuration };
};

// Parse all notes from a melody string
const parseMelody = (melody: string): ParsedNote[] => {
  const notes: ParsedNote[] = [];
  let i = 0;

  while (i < melody.length) {
    // Try to parse as a chord first
    let chordNotes: ParsedNote[] = [];
    let currentIndex = i;
    let isChord = false;
    let lastNextIndex = i;

    // Look ahead for multiple consecutive notes without duration markers
    while (currentIndex < melody.length) {
      const { note, nextIndex, hasDuration } = parseNote(
        melody,
        currentIndex,
        true,
      );
      if (!note) break;

      chordNotes.push(note);
      lastNextIndex = nextIndex;

      if (hasDuration) {
        isChord = chordNotes.length > 1;
        break;
      }
      currentIndex = nextIndex;
    }

    if (isChord) {
      // Add all chord notes without the duration styling
      notes.push(...chordNotes);
      // Move past the last note and its duration
      i = lastNextIndex;
    } else {
      // Parse as a single note
      const { note, nextIndex } = parseNote(melody, i, false);
      if (note) {
        notes.push(note);
      }
      i = nextIndex;
    }
  }

  return notes;
};

// Calculate color for a note based on its properties and key
const calculateNoteColor = (note: ParsedNote, key: KeySignature): NoteColor => {
  const scaleDegree = note.degree % 7;
  const scaleMap = getScaleMapForMode(key.mode);
  const accidentalValue =
    note.accidental === "b" ? -1 : note.accidental === "#" ? 1 : 0;
  const colorIndex = (scaleMap[scaleDegree] + accidentalValue + 12) % 12;

  let dotClass = "";
  if (note.degree >= 14) {
    dotClass = " dotAbove";
  } else if (note.degree <= 6) {
    dotClass = " dotBelow";
  }

  return { colorIndex, dotClass };
};

// Apply colors to create decorations
const applyNoteColors = (
  notes: ParsedNote[],
  colors: NoteColor[],
  melodyStartIndex: number,
  lineLength: number,
): Array<{ class: string | null }> => {
  const decorations = Array(lineLength).fill({ class: null });

  notes.forEach((note, index) => {
    const color = colors[index];
    const colorClass = `noteColor_${color.colorIndex}_colors${color.dotClass}`;

    // Color the entire note span (from start of accidental/pitch through duration)
    for (let i = note.position.start; i < note.position.end; i++) {
      decorations[melodyStartIndex + i] = { class: colorClass };
    }
  });

  return decorations;
};

// Main function to process note colors
const processNoteColors = (
  line: string,
  currentKey: KeySignature,
  allLines: string[],
  lineIndex: number,
) => {
  // Update current key based on previous lines
  for (let i = 0; i < lineIndex; i++) {
    const prevLine = allLines[i].trim();
    const keyMatch = prevLine.match(
      /^([A-G][b#]?)\s+(major|minor|lydian|mixolydian|dorian|phrygian)$/i,
    );
    if (keyMatch) {
      const [_, root, mode] = keyMatch;
      const noteToNumber: { [key: string]: number } = {
        C: 0,
        "C#": 1,
        Db: 1,
        D: 2,
        "D#": 3,
        Eb: 3,
        E: 4,
        F: 5,
        "F#": 6,
        Gb: 6,
        G: 7,
        "G#": 8,
        Ab: 8,
        A: 9,
        "A#": 10,
        Bb: 10,
        B: 11,
      };
      currentKey = {
        tonic: noteToNumber[root],
        mode: mode.toLowerCase() as KeySignature["mode"],
      };
    }
  }

  const match = line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/);
  if (!match) {
    return Array.from(line).map(() => ({ class: null }));
  }

  const [_, measureStr, beatStr, melodyPart] = match;
  const melodyStartIndex = line.indexOf(melodyPart);

  // Parse melody into structured notes
  const notes = parseMelody(melodyPart);

  // Calculate colors for each note
  const colors = notes.map((note) => calculateNoteColor(note, currentKey));

  // Apply colors to create decorations
  return applyNoteColors(notes, colors, melodyStartIndex, line.length);
};

// CodeMirror theme
export const customTheme = createTheme({
  theme: "dark",
  settings: {
    background: "#1e1e1e",
    foreground: "#ffffff",
    caret: "#ffa500",
    selection: "#036dd626",
    selectionMatch: "#036dd626",
    lineHighlight: "#8a91991a",
    gutterBackground: "#1e1e1e",
    gutterForeground: "#8a919966",
  },
  styles: [],
});

// CodeMirror plugin for character backgrounds
export const characterBackgroundsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView) {
      const builder = new RangeSetBuilder<Decoration>();
      const doc = view.state.doc;
      const allLines = doc.toString().split("\n");

      // Start with C major as default
      let currentKey: KeySignature = { tonic: 0, mode: "major" };

      // Iterate through visible lines
      for (let { from, to } of view.visibleRanges) {
        let pos = from;
        while (pos <= to) {
          const line = view.state.doc.lineAt(pos);
          const lineIndex = doc.lineAt(pos).number - 1;

          const backgrounds = getBackgroundsForLine(
            line.text,
            currentKey,
            allLines,
            lineIndex,
          );

          // Apply background to each character
          for (let i = 0; i < line.length; i++) {
            const charPos = line.from + i;
            if (charPos < line.to) {
              const decoration = backgrounds[i];
              if (decoration && decoration.class) {
                builder.add(
                  charPos,
                  charPos + 1,
                  Decoration.mark({ class: decoration.class }),
                );
              }
            }
          }
          pos = line.to + 1;
        }
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);
