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

// Function to get background colors for each character in a line
export const getBackgroundsForLine = (
  line: string,
  currentKey: KeySignature,
  allLines: string[],
  lineIndex: number,
) => {
  // Check if this line is a key signature command
  const keyMatch = line.match(/^([A-G][b#]?)\s+(major|minor)$/i);
  if (keyMatch) {
    const [_, root, mode] = keyMatch;

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
    const keyMatch = prevLine.match(/^([A-G][b#]?)\s+(major|minor)$/i);
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
        mode: mode.toLowerCase() as "major" | "minor",
      };
    }
  }

  // Check if this line is an insert command
  const insertMatch = line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/);

  if (!insertMatch) {
    return Array.from(line).map(() => ({ class: null }));
  }

  const [fullMatch, measure, beat, melodyPart] = insertMatch;

  // Calculate where the melody part starts in the full line
  const melodyStartIndex = line.indexOf(melodyPart);

  // Process only the melody part
  const melodyDecorations = Array.from(melodyPart).map((char) => {
    // Check if character is a note
    const noteDegree = NOTE_LETTER_MAP[char.toLowerCase()];

    if (noteDegree === undefined) {
      return { class: null };
    }

    // Calculate scale degree (0-6)
    const scaleDegree = noteDegree % 7;

    // Get the semitone offset from the scale map which we'll use for coloring
    const scaleMap =
      currentKey.mode === "major" ? MAJOR_SCALE_MAP : MINOR_SCALE_MAP;
    const colorIndex = scaleMap[scaleDegree];

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
