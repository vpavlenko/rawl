# Lakh album preprocessing

Run from the repository root:

```sh
python3 scripts/preprocess-lakh-albums.py --limit 3
python3 scripts/preprocess-lakh-albums.py --artist Pooh --artist "Brassens Georges" --artist Battisti
```

Without `--artist`, artists are selected by descending unique song count (numeric MIDI version suffixes are removed). `--limit` selects the top N eligible artists, including already processed artists; cached reruns are inexpensive. Beatles uses its curated data. Bach and Joplin are excluded pending work-based grouping.

Run only one instance at a time. Requests use an identifying User-Agent, are spaced at least 1.1 seconds apart, and retry transient HTTP failures. Responses are cached in ignored `scripts/untracked/musicbrainz-cache/`. Re-running resumes from this cache. Delete individual cache entries to refresh upstream data.

Generated `public/lakh-albums/<artist-slug>.json` files are loaded on demand by artist pages and score headers. They contain album title, date, MusicBrainz release-group and release IDs, track positions, cover references, and exact local MIDI filenames. Files without assignments remain visible under Other songs. Artists without generated metadata retain the flat song list.

`<artist-slug>.json` reports here list matched, unmatched, and ambiguous song titles. Fuzzy title suggestions are included for review only and never assigned automatically. Artist name search must resolve uniquely; otherwise the report contains candidates for review. Set the chosen `mbid` in `overrides.json` and rerun. Explicit artist IDs are retained across runs.

Matching strips numeric version suffixes, normalizes case, accents and punctuation, then requires an exact normalized title. Original albums take priority over singles/EPs, then earliest dates win. Release groups must have the artist as their first credited artist, avoiding albums linked only by composer or guest credits. Releases marked compilation, live, remix, etc. are excluded. The earliest dated official release from the configured home country provides the tracklist, falling back to other countries. This avoids selecting translated editions when original-language editions are available. Missing or incorrect upstream classification can still require manual correction. These are song-level assignments, not identification of the recording represented by a MIDI.

For corrections, add a `songs` object under the artist in `overrides.json`:

Artist settings can also use `allowedSecondaryTypes` (for example, `["Soundtrack"]`)
to include original soundtrack albums, and `excludedReleaseGroups` (an array of
release-group UUIDs) to exclude releases with incorrect upstream classifications.
Use `releaseOverrides` (release-group UUID to release UUID) when the default
edition has an incomplete or unsuitable tracklist.
Use `includedReleaseGroups` (release-group UUIDs) to include specific compilation
or live albums without allowing every release with those secondary types.

```json
{
  "songs": {
    "Local song title": {
      "title": "MusicBrainz track title",
      "albumId": "release-group UUID"
    }
  }
}
```

Both fields are optional; `albumId` restricts matching to that fetched album. Ambiguous repeated track positions remain unassigned for review. Covers are loaded from Cover Art Archive and hidden if unavailable. No image download is required during preprocessing.

Sources: [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API), [Cover Art Archive API](https://musicbrainz.org/doc/Cover_Art_Archive/API). Metadata and artwork have separate [licensing terms](https://musicbrainz.org/doc/About/Data_License).
