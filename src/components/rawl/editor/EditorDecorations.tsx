import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { createTheme } from "@uiw/codemirror-themes";
import {
  KeySignature,
  MAJOR_SCALE_MAP,
  MINOR_SCALE_MAP,
  NOTE_LETTER_MAP,
} from "./types";

// Text color mapping based on background color darkness
const NOTE_TEXT_COLORS: { [key: number]: string } = {
  0: "#000000", // white bg -> black text
  1: "#ffffff", // dark red -> white text
  2: "#000000", // bright red -> black text
  3: "#ffffff", // dark green -> white text
  4: "#000000", // bright green -> black text
  5: "#ffffff", // purple -> white text
  6: "#000000", // light purple -> black text
  7: "#ffffff", // gray -> white text
  8: "#ffffff", // blue -> white text
  9: "#000000", // cyan -> black text
  10: "#000000", // orange -> black text
  11: "#000000", // yellow -> black text
};

// Function to get background colors for each character in a line
export const getBackgroundsForLine = (
  line: string,
  currentKey: KeySignature,
  allLines: string[],
  lineIndex: number,
) => {
  console.log("Processing line:", line);
  console.log("Initial key:", currentKey);

  // Check if this line is a key signature command
  const keyMatch = line.match(/^([A-G][b#]?)\s+(major|minor)$/i);
  if (keyMatch) {
    const [_, root, mode] = keyMatch;
    console.log("Processing key signature line with mode:", mode);

    // Find where the mode word starts in the line
    const modeStartIndex = line.toLowerCase().indexOf(mode.toLowerCase());

    // Get the appropriate scale map based on the mode word itself
    const scaleMap =
      mode.toLowerCase() === "major" ? MAJOR_SCALE_MAP : MINOR_SCALE_MAP;

    // Define unstable pitches for coloring mode letters
    const UNSTABLE_PITCHES = [1, 2, 3, 5, 6];

    // Create array of decorations for each character
    return Array.from(line).map((char, index) => {
      // If we're within the first 5 letters of the mode word
      if (index >= modeStartIndex && index < modeStartIndex + 5) {
        const letterIndex = index - modeStartIndex;
        const unstablePitch = UNSTABLE_PITCHES[letterIndex];
        const colorIndex = scaleMap[unstablePitch];
        return { class: `noteColor_${colorIndex}_colors` };
      }
      return { class: null };
    });
  }

  // Process all previous lines to find the latest key signature
  for (let i = 0; i < lineIndex; i++) {
    const prevLine = allLines[i].trim();
    console.log("Checking previous line for key:", prevLine);
    const keyMatch = prevLine.match(/^([A-G][b#]?)\s+(major|minor)$/i);
    if (keyMatch) {
      const [_, root, mode] = keyMatch;
      console.log("Found key change:", root, mode);
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
        mode: mode.toLowerCase() as "major" | "minor",
      };
      console.log("Updated key:", currentKey);
    }
  }

  // Check if this line is an insert command
  const insertMatch = line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/);
  console.log("Insert command match:", insertMatch);

  if (!insertMatch) {
    console.log("Not an insert command, returning null");
    return Array.from(line).map(() => ({ class: null }));
  }

  const [fullMatch, measure, beat, melodyPart] = insertMatch;
  console.log("Melody part:", melodyPart);

  // Calculate where the melody part starts in the full line
  const melodyStartIndex = line.indexOf(melodyPart);

  // Process only the melody part
  const melodyDecorations = Array.from(melodyPart).map((char, index) => {
    console.log("\nProcessing char:", char, "at index:", index);

    // Check if character is a note
    const noteDegree = NOTE_LETTER_MAP[char.toLowerCase()];
    console.log("Note degree from map:", noteDegree);

    if (noteDegree === undefined) {
      console.log("Not a note, returning null");
      return { class: null };
    }

    // Calculate scale degree (0-6)
    const scaleDegree = noteDegree % 7;
    console.log("Scale degree (0-6):", scaleDegree);

    // Get the semitone offset from the scale map which we'll use for coloring
    const scaleMap =
      currentKey.mode === "major" ? MAJOR_SCALE_MAP : MINOR_SCALE_MAP;
    const colorIndex = scaleMap[scaleDegree];
    console.log("Color index from scale map:", colorIndex);

    // Add dot classes based on note degree
    let dotClass = "";
    if (noteDegree >= 14) {
      dotClass = " dotAbove";
    } else if (noteDegree <= 6) {
      dotClass = " dotBelow";
    }

    return {
      class: `noteColor_${colorIndex}_colors${dotClass}`,
    };
  });

  return [
    ...Array(melodyStartIndex).fill({ class: null }),
    ...melodyDecorations,
  ];
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
      console.log("Plugin constructor called");
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      console.log("Plugin update called");
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView) {
      console.log("\nBuilding decorations");
      const builder = new RangeSetBuilder<Decoration>();
      const doc = view.state.doc;
      const allLines = doc.toString().split("\n");
      console.log("Total lines:", allLines.length);

      // Start with C major as default
      let currentKey: KeySignature = { tonic: 0, mode: "major" };
      console.log("Starting with key:", currentKey);

      // Iterate through visible lines
      for (let { from, to } of view.visibleRanges) {
        console.log("\nProcessing visible range:", from, "to", to);
        let pos = from;
        while (pos <= to) {
          const line = view.state.doc.lineAt(pos);
          const lineIndex = doc.lineAt(pos).number - 1;
          console.log("\nProcessing line:", line.text, "at index:", lineIndex);

          const backgrounds = getBackgroundsForLine(
            line.text,
            currentKey,
            allLines,
            lineIndex,
          );
          console.log("Got backgrounds:", backgrounds);

          // Apply background to each character
          for (let i = 0; i < line.length; i++) {
            const charPos = line.from + i;
            if (charPos < line.to) {
              const decoration = backgrounds[i];
              if (decoration.class) {
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
