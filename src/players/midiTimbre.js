// Only packaged, versioned timbres can be selected by portable MIDI metadata.
import qanunSoundfont from "./qanunSoundfont.json";
import levels from "../sampler/qanunLevels.json";
export const QANUN_SOUNDFONT = qanunSoundfont.file;
export const OUD_SOUNDFONT = "rawl-oud-1e42128ba5cd.sf2";
export function applyMidiTimbreGain(pcm, offset, length, timbre) {
  if (timbre !== "qanun") return;
  for (let i = offset; i < offset + length; i++) {
    const value = pcm[i] * levels.midiGain;
    const peak = Math.abs(value);
    // Leave normal attacks untouched; contain unusually loud tail overlaps.
    pcm[i] = peak <= 0.95 ? value
      : Math.sign(value) * (0.95 + 0.05 * Math.tanh((peak - 0.95) / 0.05));
  }
}
export function getMidiTimbre(midiFile) {
  const tags = midiFile.tracks.flatMap((_, index) => midiFile.getTrackEvents(index).filter(event =>
    event.type === 255 && event.subtype === 1 && event.data &&
    event.data.length < 64
  ).map(event => Array.from(event.data, value => String.fromCharCode(value)).join("")));
  if (tags.includes("RAWL_TIMBRE:qanun")) return "qanun";
  return tags.includes("RAWL_TIMBRE:oud") ? "oud" : undefined;
}
