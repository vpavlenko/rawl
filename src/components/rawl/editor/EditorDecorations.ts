import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { createTheme } from "@uiw/codemirror-themes";
import { parseCommand } from "./commandParser";
import {
  CommandContext,
  getScaleMapForMode,
  KeySignature,
  NOTE_LETTER_MAP,
} from "./types";

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

// Add cache types and helper functions
interface LineCache {
  decorations: Array<{ class: string | null }>;
  key: KeySignature;
}

const lineCache = new Map<number, LineCache>();

const isKeySignatureLine = (line: string): boolean => {
  return !!line.match(
    /^([A-G][b#]?)\s+(major|minor|lydian|mixolydian|dorian|phrygian)$/i,
  );
};

const shouldInvalidateCache = (
  lineNumber: number,
  allLines: string[],
): boolean => {
  // Find the last key signature change before this line
  for (let i = lineNumber - 1; i >= 0; i--) {
    if (isKeySignatureLine(allLines[i])) {
      // If we find a key signature change, check if it's cached
      const cached = lineCache.get(lineNumber);
      if (!cached) return true;

      // Calculate what the key should be at this line
      let currentKey: KeySignature = { tonic: 0, mode: "major" };
      for (let j = 0; j <= i; j++) {
        const keyMatch = allLines[j].match(
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

      // Compare with cached key
      return (
        cached.key.tonic !== currentKey.tonic ||
        cached.key.mode !== currentKey.mode
      );
    }
  }
  return false;
};

// Function to get background colors for each character in a line
export const getBackgroundsForLine = (
  line: string,
  currentKey: KeySignature,
  allLines: string[],
  lineIndex: number,
) => {
  // Get the base decorations first (for backgrounds)
  let baseDecorations = Array.from(line).map(() => ({ class: null }));

  // Skip empty lines and comments
  const cleanLine = line.split("%")[0].trim();
  if (!cleanLine) return baseDecorations;

  // Create a context for command parsing
  const context: CommandContext = {
    currentKey,
    currentTrack: 1,
    timeSignatures: [{ numerator: 4, measureStart: 1 }],
    channelOctaves: {
      0: 5,
      1: 3,
    },
    currentBpm: 120,
  };

  // Try to parse the line as a command
  const isValidCommand = parseCommand(cleanLine, context) !== null;

  // If the line is not a valid command, apply strikethrough to all non-whitespace characters
  if (!isValidCommand) {
    let inWhitespace = true;
    baseDecorations = Array.from(line).map((char) => {
      if (char.trim() === "") {
        inWhitespace = true;
        return { class: null };
      }
      if (inWhitespace) {
        inWhitespace = false;
      }
      return { class: "invalid-command" };
    });
  }

  // Debug logging
  console.log("Processing line:", JSON.stringify(line));

  // Process key signature and note colors first
  if (
    line.match(
      /^([A-G][b#]?)\s+(major|minor|lydian|mixolydian|dorian|phrygian)$/i,
    )
  ) {
    baseDecorations = processKeySignature(line, currentKey);
  } else if (line.match(/^\s*(\d+(?:b\d+(?:\.\d+)?)?)\s+i\s+/)) {
    // Handle 'i' command with more flexible measure format
    const match = line.match(/^\s*(\d+(?:b\d+(?:\.\d+)?)?)\s+(i)\s+/);
    if (match) {
      console.log("Found i command:", match);
      // Use word boundary matching for 'i' command
      const cmdMatch = line.match(/\bi\b/);
      if (cmdMatch && cmdMatch.index !== undefined) {
        console.log("Styling i command at index:", cmdMatch.index);
        baseDecorations[cmdMatch.index] = { class: "command-name" };
        console.log("Applied command-name class at index:", cmdMatch.index);
      }
    }
    // Process note colors but preserve command styling
    const noteDecorations = processNoteColors(
      line,
      currentKey,
      allLines,
      lineIndex,
    );
    baseDecorations = baseDecorations.map((dec, i) => {
      const result = {
        class: dec.class ? dec.class : noteDecorations[i].class,
      };
      if (dec.class === "command-name") {
        console.log("Preserving command-name class at index:", i);
      }
      return result;
    });
  } else {
    // Handle 'c' and 'ac' commands with more flexible patterns
    // Match patterns like:
    // "19  c 18    0 x x 0 0"
    // "21b2 c 17b2-20b3 7"
    // "7   c 6-6b3 0"
    // "9    ac 1-9     0"
    // "2    c 1" - with default shift of 0
    const copyMatch = line.match(
      /^\s*(\d+(?:b\d+(?:\.\d+)?)?)\s+(c|ac)\s+(\d+(?:b\d+)?(?:-\d+(?:b\d+)?)?)\s*/,
    );

    if (copyMatch) {
      console.log("Found copy command:", copyMatch);
      const [fullMatch, targetMeasure, cmd, sourceSpan] = copyMatch;
      console.log("Command details:", { targetMeasure, cmd, sourceSpan });

      // Find exact indices to handle var
      const cmdMatch = line.match(new RegExp(`\\b${cmd}\\b`));

      if (cmdMatch && cmdMatch.index !== undefined) {
        console.log("Styling command at index:", cmdMatch.index);
        // Style the command
        for (let i = cmdMatch.index; i < cmdMatch.index + cmd.length; i++) {
          baseDecorations[i] = { class: "command-name" };
        }

        // Find the source span after the command token
        const afterCmd = line.slice(cmdMatch.index + cmd.length);
        const spanMatch = afterCmd.match(new RegExp(`\\b${sourceSpan}\\b`));

        if (spanMatch && spanMatch.index !== undefined) {
          // Adjust the index to be relative to the full line
          const spanStartIndex = cmdMatch.index + cmd.length + spanMatch.index;
          // Style the source span
          for (
            let i = spanStartIndex;
            i < spanStartIndex + sourceSpan.length;
            i++
          ) {
            baseDecorations[i] = { class: "source-span" };
          }
        }
      } else {
        // Debug when no match is found
        console.log("No command match found for line");
      }
    } else {
      // Debug when no match is found
      console.log("No command match found for line");
    }
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
    if (/[+_\-=,'"]/.test(melody[i])) {
      hasDuration = true;
      durationStart = i;
      duration += melody[i];
      i++;
      // Check for dot or triplet
      if (i < melody.length && (melody[i] === "." || melody[i] === ":")) {
        duration += melody[i];
        i++;
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
      end: i, // Now includes duration for single notes
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
  // Validate input parameters
  if (melodyStartIndex < 0 || lineLength <= 0) {
    return [];
  }

  const decorations = Array(lineLength).fill({ class: null });

  // First, identify chord groups
  const chordGroups = new Set<number>();
  let currentChordStart = -1;

  for (let i = 0; i < notes.length; i++) {
    if (notes[i].isPartOfChord) {
      if (currentChordStart === -1) {
        currentChordStart = i;
      }
      chordGroups.add(i);
    } else if (currentChordStart !== -1) {
      // End of chord group
      currentChordStart = -1;
    }
  }

  notes.forEach((note, index) => {
    const color = colors[index];
    const colorClass = `noteColor_${color.colorIndex}_colors${color.dotClass}`;

    // Calculate the absolute positions in the line
    const absoluteStart = melodyStartIndex + note.position.start;
    const absoluteEnd = melodyStartIndex + note.position.end;
    const absoluteDurationStart =
      note.position.durationStart !== undefined
        ? melodyStartIndex + note.position.durationStart
        : absoluteEnd;

    // Ensure we don't exceed array bounds
    if (absoluteStart >= lineLength) {
      return;
    }

    if (chordGroups.has(index)) {
      // For chord notes, only color the pitch and accidental
      const end = Math.min(absoluteDurationStart, lineLength);
      for (let i = absoluteStart; i < end; i++) {
        decorations[i] = { class: colorClass };
      }
    } else {
      // For single notes, color the entire span including duration
      const end = Math.min(absoluteEnd, lineLength);
      for (let i = absoluteStart; i < end; i++) {
        decorations[i] = { class: colorClass };
      }
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
    selection: "rgba(255, 255, 255, 0.2)",
    selectionMatch: "rgba(255, 255, 255, 0.2)",
    lineHighlight: "#8a91991a",
    gutterBackground: "#1e1e1e",
    gutterForeground: "#8a919966",
  },
  styles: [{ tag: tags.comment, color: "#666666", fontStyle: "italic" }],
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
        // Clear cache for changed lines
        if (update.docChanged) {
          update.changes.iterChangedRanges((fromA, toA) => {
            const fromLine = update.state.doc.lineAt(fromA).number;
            const toLine = update.state.doc.lineAt(toA).number;
            for (let i = fromLine; i <= toLine; i++) {
              lineCache.delete(i);
            }
          });
        }
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

          // Check cache first
          let backgrounds: Array<{ class: string | null }>;
          const cached = lineCache.get(lineIndex + 1);

          if (cached && !shouldInvalidateCache(lineIndex, allLines)) {
            backgrounds = cached.decorations;
          } else {
            backgrounds = getBackgroundsForLine(
              line.text,
              currentKey,
              allLines,
              lineIndex,
            );
            // Cache the result
            lineCache.set(lineIndex + 1, {
              decorations: backgrounds,
              key: { ...currentKey },
            });
          }

          // Update current key if this is a key signature line
          if (isKeySignatureLine(line.text)) {
            const [_, root, mode] = line.text.match(
              /^([A-G][b#]?)\s+(major|minor|lydian|mixolydian|dorian|phrygian)$/i,
            )!;
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
