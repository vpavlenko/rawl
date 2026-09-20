# Lakh clean subset

This is Colin Raffel's **Clean MIDI subset**, linked from
https://colinraffel.com/projects/lmd/ . It contains artist/title filenames,
including separate numbered arrangements. LMD-full uses checksum filenames;
LMD-matched and LMD-aligned serve different purposes and are not used here.
The artist labels are supplied by the dataset, not verified composer credits.

Source: http://hog.ee.columbia.edu/craffel/lmd/clean_midi.tar.gz
License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Attribution: Colin Raffel, *Learning-Based Methods for Comparing Sequences,
with Applications to Audio-to-MIDI Alignment and Matching*, PhD thesis, 2016.
Dataset page: https://colinraffel.com/projects/lmd/

The MIDI bytes are unchanged. The original tarball is repackaged as sorted ZIP
parts below GitHub's per-file size limit. `manifest.json` records SHA-256 hashes
of the source and every part. Original MIDI copyright meta-events are retained.

## Static delivery

- `public/lakh-index.json` lists artists and tracks; the browser loads it on demand.
- `scripts/prepare-lakh.js` expands the bundled ZIPs using the existing
  `node-stream-zip` dependency. No external commands, network, or Git LFS needed.
- Both `scripts/start.js` and `scripts/build.js` call it. Production extracts
  directly into `build/lakh-data`; development uses ignored `public/lakh-data`.
- Run `npm run prepare-lakh` to supply files to an already-running dev server.
- Playback fetches just the selected MIDI from `/lakh-data/<artist>/<filename>`.
- SPA pages use `/lakh/`, `/lakh/<artist_slug>`, and `/lakh/<artist_slug>/<track_slug>`;
  track pages omit the `.mid` extension. Hosts must use the app's usual SPA fallback.
- `/c/MIDI/...` bookmarks redirect while preserving query strings and fragments.
  Analysis storage keeps the exact `c/MIDI/<artist>/<filename>` key, so existing
  bundled and Firebase annotations work without copying or migrating records.
- Gold artist folders indicate at least one annotated file; green tracks indicate
  that exact file is annotated. Counts use the merged, current analyses state.
- `c/Classical MIDI/...` is a separate collection, outside this dataset's scope.

To repackage an official archive:

```
python3 scripts/import-lakh.py /path/to/clean_midi.tar.gz
npm run prepare-lakh
```

The importer only keeps `clean_midi/<artist>/<track>.mid`, preserves arrangement
suffixes, and reports any bundled Lakh analyses without an exact matching file.

## Matching the historical chiptune catalog

The official archive contains 17,256 tracks in 2,197 artist folders. Of the 277
bundled `c/MIDI/` analysis keys, 266 match its filenames directly. Three sampled
arrangements (ABBA's Waterloo, The Beatles' Eleanor Rigby.4, and Usher's My Way.1)
were also compared with chiptune's `gifx.co/music` source: their bytes are identical.

`chiptune-annotations.zip` supplies the ten remaining track references: five are
byte-identical Lakh files under different artist folders, and five are additions
from chiptune. `chiptune-sources.json` records their original URLs, SHA-256 hashes,
and identical official paths where applicable. These files keep their embedded
attribution; the official dataset license statement above applies to the Lakh
subset, and does not establish a license for chiptune's five additional files.
The importer automatically merges this supplement into the generated catalog.

All 276 track-specific bundled Lakh analyses therefore have a corresponding
file. The remaining key, `c/MIDI/The Beatles`, names only a directory and cannot
be assigned to a track without further information. It is left untouched.

The served catalog has 17,266 paths and 2,203 artist folders, including those
compatibility additions. The ZIPs occupy approximately 225 MB; the extracted
MIDI data occupies approximately 800 MB. Files with nonstandard MIDI headers
are preserved from the source; the player reports an error if it cannot load one.

## Readable, persistent URLs

`node scripts/generate-lakh-routes.js` enriches the catalog with ASCII slugs.
It transliterates names, replaces punctuation and whitespace with underscores,
retains capitalization and arrangement numbers, and adds a stable hash suffix
when names collide. For example, `ABBA/Money, Money, Money.mid` becomes
`/lakh/ABBA/Money_Money_Money`.

`assets/lakh/routes.json` is the persistent registry. Keep it in version control:
imports reuse its slugs and retain removed entries to prevent URL reuse. The
importer invokes the generator automatically; it can also be run independently
without downloading or repackaging the MIDI archives. New slugs cannot shadow
another existing filename URL. The browser uses the generated catalog mapping
for playback and annotation keys, never a guessed filename derived from a slug.

Both the previous encoded `/lakh/...` links and `/c/MIDI/...` bookmarks resolve
through the catalog and redirect to canonical URLs, preserving query strings
and fragments. Track page titles use `Title - Musician` with original labels;
artist pages use `Musician - Lakh`. Leaving Lakh restores the previous title.

## Removing voices from an arrangement

For signed-in users, hovering a voice's controls reveals a Lucide trash button
that removes that voice. Keyboard focus also reveals it. **Restore** is available
under **Removed voices** while signed in.
The annotation field `excludedVoices` stores zero-based original parsed voice
indices, e.g. `"excludedVoices": [1, 4]` removes the second and fifth voices.
It is independent of the temporary solo/mute mask: unmuting or unsoloing never
reenables excluded voices. Removing a voice hides its notes and silences playback;
restoring it restores its notes and enables playback. The original MIDI is not
modified, and remaining voices retain their indices and colors. Timing and
manual measure boundaries are retained. New snippet exports use the filtered
arrangement; existing frozen snippets remain snapshots of when they were saved.

Exclusions use the existing annotation saving flow (Firebase for signed-in users;
session state when signed out) and the existing `c/MIDI/...` annotation key.
Missing `excludedVoices` means no exclusions. Invalid, repeated, or out-of-range
indices are ignored. The current schema and bundled analyses had no existing
voice-exclusion field; `issues:mute_voices` was only an issue tag.

## Interpreting a voice as GM drums

The Lucide drum button beside the trash button toggles a pitched voice's
interpretation. It shares the signed-in and per-voice hover/focus rules. The
annotation field `drumVoices` stores original zero-based voice indices. Selected
voices use the existing GM drum labels and percussion rows instead of pitched
note rows; note numbers are unchanged. They use the standard percussion preset
in the SoundFont player while retaining separate source channels for solo/mute.
Source bank/program changes and pitch bends cannot override that interpretation.
The override is reapplied after seeking, player resets, and SoundFont changes.
Clicking again restores the original pitched interpretation and instrument.
Native drum voices do not need this override and do not show this toggle.
Removal and drum interpretation are independent: restoring an excluded drum
voice keeps its drum interpretation. The original MIDI remains unchanged.
