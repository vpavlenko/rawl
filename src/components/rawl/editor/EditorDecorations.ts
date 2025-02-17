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
  // Get the base decorations first (for backgrounds)
  let baseDecorations = Array.from(line).map(() => ({ class: null }));

  // Process key signature and note colors first
  if (line.match(/^([A-G][b#]?)\s+(major|minor)$/i)) {
    baseDecorations = processKeySignature(line, currentKey);
  } else if (line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/)) {
    baseDecorations = processNoteColors(line, currentKey, allLines, lineIndex);
  }

  // Then handle comments, preserving any background colors
  // Check if any previous line is just '#'
  for (let i = 0; i < lineIndex; i++) {
    if (allLines[i].trim() === "#") {
      return baseDecorations.map((decoration) => ({
        class: decoration.class ? `${decoration.class} comment` : "comment",
      }));
    }
  }

  // Check for comments in current line
  const commentIndex = line.indexOf("#");
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
  const [_, root, mode] = line.match(/^([A-G][b#]?)\s+(major|minor)$/i)!;
  const modeStartIndex = line.toLowerCase().indexOf(mode.toLowerCase());
  const scaleMap =
    mode.toLowerCase() === "major" ? MAJOR_SCALE_MAP : MINOR_SCALE_MAP;
  const UNSTABLE_PITCHES = [1, 2, 3, 5, 6];

  return Array.from(line).map((char, index) => {
    if (index >= modeStartIndex && index < modeStartIndex + 5) {
      const letterIndex = index - modeStartIndex;
      const unstablePitch = UNSTABLE_PITCHES[letterIndex];
      const colorIndex = scaleMap[unstablePitch];
      return { class: `noteColor_${colorIndex}_colors` };
    }
    return { class: null };
  });
};

// Helper function to process note colors
const processNoteColors = (
  line: string,
  currentKey: KeySignature,
  allLines: string[],
  lineIndex: number,
) => {
  // Update current key based on previous lines
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

  const match = line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/);
  if (!match) return Array.from(line).map(() => ({ class: null }));

  const [_, __, ___, melodyPart] = match;
  const melodyStartIndex = line.indexOf(melodyPart);

  const melodyDecorations = Array.from(melodyPart).map((char) => {
    const noteDegree = NOTE_LETTER_MAP[char.toLowerCase()];
    if (noteDegree === undefined) return { class: null };

    const scaleDegree = noteDegree % 7;
    const scaleMap =
      currentKey.mode === "major" ? MAJOR_SCALE_MAP : MINOR_SCALE_MAP;
    const colorIndex = scaleMap[scaleDegree];

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
