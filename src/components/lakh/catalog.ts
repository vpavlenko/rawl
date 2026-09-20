export type LakhArtist = {
  name: string;
  slug: string;
  tracks: string[];
  trackSlugs: Record<string, string>;
};
export type LakhCatalog = { artists: LakhArtist[]; trackCount: number };

export const lakhAnalysisKey = (artist: string, track: string) =>
  `c/MIDI/${artist}/${track}`;
export const lakhArtistUrl = (artist: LakhArtist) => `/lakh/${artist.slug}`;
export const lakhTrackUrl = (artist: LakhArtist, track: string) =>
  `${lakhArtistUrl(artist)}/${artist.trackSlugs[track]}`;

// Resolve both the new slugs and historical filename URLs through the catalog.
// Never reconstruct a MIDI filename or annotation key from a slug.
export function resolveLakhRoute(
  catalog: LakhCatalog | null,
  pathname: string,
) {
  const legacy = pathname.startsWith("/c/MIDI");
  const segments = pathname
    .replace(legacy ? /^\/c\/MIDI\/?/ : /^\/lakh\/?/, "")
    .replace(/\/$/, "")
    .split("/");
  let artistSegment = "",
    trackSegment = "";
  let invalid = segments.length > 2;
  try {
    artistSegment = decodeURIComponent(segments[0] || "");
    trackSegment = decodeURIComponent(segments[1] || "");
  } catch {
    invalid = true;
  }
  const artist = invalid
    ? undefined
    : (!legacy &&
        catalog?.artists.find((item) => item.slug === artistSegment)) ||
      catalog?.artists.find((item) => item.name === artistSegment);
  const track =
    artist && trackSegment
      ? (!legacy &&
          artist.tracks.find(
            (file) => artist.trackSlugs[file] === trackSegment,
          )) ||
        artist.tracks.find(
          (file) =>
            (legacy ? file : file.replace(/\.mid$/i, "")) === trackSegment,
        )
      : undefined;
  const canonicalPath = invalid
    ? null
    : track && artist
    ? lakhTrackUrl(artist, track)
    : artist && !trackSegment
    ? lakhArtistUrl(artist)
    : !artistSegment && !trackSegment
    ? "/lakh/"
    : null;
  return { artist, track, artistSegment, trackSegment, invalid, canonicalPath };
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
