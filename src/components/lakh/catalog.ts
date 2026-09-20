export type LakhArtist = { name: string; tracks: string[] };
export type LakhCatalog = { artists: LakhArtist[]; trackCount: number };

export const lakhAnalysisKey = (artist: string, track: string) =>
  `c/MIDI/${artist}/${track}`;
export const lakhArtistUrl = (artist: string) =>
  `/lakh/${encodeURIComponent(artist)}`;
export const lakhTrackUrl = (artist: string, track: string) =>
  `${lakhArtistUrl(artist)}/${encodeURIComponent(
    track.replace(/\.mid$/i, ""),
  )}`;

// Keep old bookmarks working without changing their saved annotation keys.
export function legacyLakhUrl(pathname: string): string | null {
  if (!pathname.startsWith("/c/MIDI/")) return null;
  try {
    const [artist, ...track] = pathname
      .slice(8)
      .split("/")
      .map(decodeURIComponent);
    return track.length
      ? lakhTrackUrl(artist, track.join("/"))
      : lakhArtistUrl(artist);
  } catch {
    return null;
  }
}

let catalogPromise: Promise<LakhCatalog> | undefined;
export function loadLakhCatalog(): Promise<LakhCatalog> {
  if (!catalogPromise) {
    catalogPromise = fetch(`${process.env.PUBLIC_URL}/lakh-index.json`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load the Lakh catalog.");
        return response.json();
      })
      .catch((error) => {
        catalogPromise = undefined;
        throw error;
      });
  }
  return catalogPromise;
}
