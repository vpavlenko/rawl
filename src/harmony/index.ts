import { loadLakhCatalog } from "../components/lakh/catalog";
import {
  HARMONY_VERSION,
  HarmonyResult,
  measureAt,
  Quality,
  romanNumeral,
} from "./harmony";
export type IndexedTrack = {
  artist: string;
  title: string;
  url: string;
  sequence: string;
  certainty: string;
  starts: number[];
  ends: number[];
  keySource: string;
};
export type HarmonyIndex = {
  version: string;
  generatedAt: string;
  attempted: number;
  indexed: number;
  skipped: number;
  tracks: IndexedTrack[];
};
let indexPromise: Promise<HarmonyIndex>;
async function readHarmonyAsset(url: string) {
  // Static .gz files have no Content-Encoding header. Response handles hosts
  // that do set it; the gzip magic check prevents decompressing them twice.
  const response = await fetch(url);
  if (!response.ok) throw new Error("The harmonic index is unavailable.");
  const buffer = await response.arrayBuffer(),
    bytes = new Uint8Array(buffer);
  if (bytes[0] === 31 && bytes[1] === 139) {
    const stream = new Blob([buffer])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream).json();
  }
  return JSON.parse(new TextDecoder().decode(buffer));
}
export function loadHarmonyIndex() {
  if (!indexPromise)
    indexPromise = readHarmonyAsset(
      `${process.env.PUBLIC_URL}/harmony/index.json.gz`,
    )
      .then((data) => {
        if (data.version !== HARMONY_VERSION)
          throw new Error("The harmonic index needs to be refreshed.");
        return data;
      })
      .catch((e) => {
        indexPromise = undefined;
        throw e;
      });
  return indexPromise;
}
// Fetch only one artist's sidecar when inspecting a score, not the corpus index.
export async function loadIndexedHarmony(
  key: string,
  measures: number[],
  annotationConfig: string,
): Promise<HarmonyResult | null> {
  const prefix = "c/MIDI/";
  if (!key?.startsWith(prefix)) return null;
  const slash = key.indexOf("/", prefix.length),
    artistName = key.slice(prefix.length, slash),
    file = key.slice(slash + 1);
  const catalog = await loadLakhCatalog(),
    artist = catalog.artists.find((a) => a.name === artistName);
  if (!artist) return null;
  const detail = (
    await readHarmonyAsset(
      `${process.env.PUBLIC_URL}/harmony/details/${encodeURIComponent(
        artist.slug,
      )}.json.gz`,
    )
  )[file];
  if (
    !detail ||
    detail.version !== HARMONY_VERSION ||
    detail.annotationConfig !== annotationConfig
  )
    return null;
  return {
    ...detail,
    chords: detail.chords.map(
      ([start, end, root, quality, bass, confidence, tonic, keyConfidence]: [
        number,
        number,
        number,
        Quality,
        number,
        number,
        number,
        number,
      ]) => ({
        start,
        end,
        root,
        quality,
        bass,
        confidence,
        tonic,
        keyConfidence,
        measure: measureAt(measures, start),
        roman: root == null ? "?" : romanNumeral(root, quality, tonic),
        alternatives: [],
      }),
    ),
  };
}
