import { createContext } from "react";
import { ColoredNotesInVoices } from "./parseMidi";

export const VoiceZIndicesContext = createContext<ReadonlyMap<number, number>>(
  new Map(),
);

export const getSortedVoices = (
  voiceNames: string[],
  notes: ColoredNotesInVoices,
  drumVoices: number[] = [],
  nativeDrumVoices: number[] = [],
) => {
  const drums = new Set([...drumVoices, ...nativeDrumVoices]);
  return voiceNames
    .map((voiceName, voiceIndex) => {
      const voiceNotes = notes[voiceIndex] ?? [];
      return {
        voiceName,
        voiceIndex,
        isDrum:
          drums.has(voiceIndex) || voiceNotes.some((note) => note.isDrum),
        averagePitch: voiceNotes.length
          ? voiceNotes.reduce(
              (sum, note) => sum + (note.displayMidiNumber ?? note.note.midiNumber), 0,
            ) /
            voiceNotes.length
          : -Infinity,
      };
    })
    .sort(
      (a, b) =>
        Number(a.isDrum) - Number(b.isDrum) ||
        b.averagePitch - a.averagePitch ||
        a.voiceIndex - b.voiceIndex,
    );
};

// Arrange from the current lowest pitched voice upward. A note overlaps when
// an already-arranged lower voice reaches its pitch during its sounding span.
export const getAutoVoiceOctaveShifts = (
  voiceNames: string[],
  notes: ColoredNotesInVoices,
  currentShifts: Record<number, number>,
  drumVoices: number[] = [],
  nativeDrumVoices: number[] = [],
  excludedVoices: number[] = [],
): Record<number, number> => {
  const shifts = { ...currentShifts };
  const excluded = new Set(excludedVoices);
  const voices = getSortedVoices(voiceNames, notes, drumVoices, nativeDrumVoices)
    .filter(({ voiceIndex, isDrum }) =>
      !isDrum && !excluded.has(voiceIndex) && notes[voiceIndex]?.length,
    )
    .reverse();
  const lowerNotes: { pitch: number; start: number; end: number }[] = [];

  voices.forEach(({ voiceIndex }, index) => {
    const voice = notes[voiceIndex];
    let additionalOctaves = 0;
    if (index > 0) {
      // Each requirement is the minimum upward shift for this note to clear
      // every simultaneous lower note. Allow floor(5% * note count) exceptions.
      const requirements = voice.map((note) => {
        const pitch = note.displayMidiNumber ?? note.note.midiNumber;
        let required = 0;
        for (const lower of lowerNotes) {
          if (lower.start >= note.span[1]) break;
          if (lower.end > note.span[0] && note.span[1] > note.span[0]) {
            required = Math.max(required, Math.floor((lower.pitch - pitch) / 12) + 1);
          }
        }
        return required;
      }).sort((a, b) => a - b);
      additionalOctaves = requirements[requirements.length - 1 - Math.floor(voice.length * 0.05)];
    }
    const shift = (currentShifts[voiceIndex] ?? 0) + additionalOctaves;
    if (shift === 0) delete shifts[voiceIndex];
    else shifts[voiceIndex] = shift;
    voice.forEach((note) => {
      if (note.span[1] <= note.span[0]) return;
      lowerNotes.push({
        pitch: (note.displayMidiNumber ?? note.note.midiNumber) + 12 * additionalOctaves,
        start: note.span[0],
        end: note.span[1],
      });
    });
    lowerNotes.sort((a, b) => a.start - b.start);
  });
  return shifts;
};
