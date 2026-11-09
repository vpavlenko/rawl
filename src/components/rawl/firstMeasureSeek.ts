import type { Analysis } from "./analysis";
import type { ParsingResult } from "./parseMidi";
import { buildManualMeasuresAndBeats } from "./measures";

const cache = new WeakMap<ParsingResult, {
  manualMeasures: Analysis["measures"];
  startMs: number;
  endMs: number;
  firstNoteMs: number;
}>();

// Keep every seek entry point consistent, including the footer and keyboard.
export function snapFirstMeasureSeek(
  seekMs: number,
  parsing: ParsingResult | null,
  manualMeasures?: Analysis["measures"],
): number {
  if (!parsing || !Number.isFinite(seekMs)) return seekMs;
  let range = cache.get(parsing);
  if (!range || range.manualMeasures !== manualMeasures) {
    const notes = parsing.notes.flat();
    const firstNote = notes.reduce(
      (first, note) => Math.min(first, note.span[0]), Infinity,
    );
    if (!Number.isFinite(firstNote)) return seekMs;
    const measures = manualMeasures
      ? buildManualMeasuresAndBeats(manualMeasures, notes).measures
      : parsing.measuresAndBeats.measures;
    // A note before the first grid boundary is a pickup, not an empty bar.
    let start = Math.min(0, firstNote);
    let end = Infinity;
    for (const boundary of measures) {
      if (boundary <= firstNote) start = boundary;
      else {
        end = boundary;
        break;
      }
    }
    range = {
      manualMeasures, startMs: start * 1000, endMs: end * 1000,
      firstNoteMs: firstNote * 1000,
    };
    cache.set(parsing, range);
  }
  return seekMs >= range.startMs && seekMs < range.endMs
    ? range.firstNoteMs
    : seekMs;
}
