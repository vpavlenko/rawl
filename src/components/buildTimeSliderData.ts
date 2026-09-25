import { Analysis, getDrumVoices, getExcludedVoices, getPhraseStarts } from "./rawl/analysis";
import { buildManualMeasuresAndBeats } from "./rawl/measures";
import { ParsingResult } from "./rawl/parseMidi";
import { getModulations, getNoteColorPitchClass } from "./rawl/Rawl";
import { cachedTimeSliderData, selectBassNotes } from "./timeSliderData";

export function buildTimeSliderData(parsingResult: ParsingResult, analysis: Analysis) {
  const excludedVoices = getExcludedVoices(analysis, parsingResult.notes.length);
  const drumVoices = getDrumVoices(analysis, parsingResult.notes.length);
  const key = JSON.stringify([
    analysis.measures, analysis.modulations, analysis.sections,
    analysis.phrasePatch, excludedVoices, [...drumVoices].sort(),
  ]);
  return cachedTimeSliderData(parsingResult, key, async () => {
    const timingNotes = parsingResult.notes.flat();
    const notes = parsingResult.notes.map((voice, index) =>
      excludedVoices.includes(index) ? [] : drumVoices.includes(index)
        ? voice.map((note) => ({ ...note, isDrum: true })) : voice,
    );
    const measures = analysis.measures
      ? buildManualMeasuresAndBeats(analysis.measures, timingNotes).measures
      : parsingResult.measuresAndBeats.measures;
    const phraseStarts = getPhraseStarts(analysis, measures.length);
    const modulations = getModulations(analysis);
    const bassNotes = await selectBassNotes(notes.flat(), measures);
    return {
      phraseStartTimesMs: phraseStarts
        .map((measure) => measures[measure - 1] * 1000)
        .filter((time) => Number.isFinite(time) && time >= 0),
      sectionStartTimesMs: (analysis.sections ?? [0])
        .map((section) => measures[phraseStarts[section] - 1] * 1000)
        .filter((time) => Number.isFinite(time) && time >= 0),
      modulationMarkers: modulations.flatMap(({ measure, tonic }, index) => {
        const previousTonic = modulations[index - 1]?.tonic;
        const timeMs = measures[measure] * 1000;
        if (tonic == null || previousTonic == null || !Number.isFinite(timeMs) || timeMs < 0)
          return [];
        return [{ timeMs, pitchClass: (tonic - previousTonic + 12) % 12 }];
      }),
      bassBars: bassNotes.map(({ start, end, note }) => ({
        startMs: start * 1000,
        endMs: end * 1000,
        pitchClass: getNoteColorPitchClass(note, analysis, measures),
      })),
    };
  });
}
