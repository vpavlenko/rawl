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
          ? voiceNotes.reduce((sum, note) => sum + note.note.midiNumber, 0) /
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
