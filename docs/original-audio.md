# Original recordings

A MIDI document may have an `originalAudio` field (see `OriginalAudioAsset`).
Only linked recordings expose the footer's keyboard/guitar button. The original
recording is the default whenever it is available; other pieces use MIDI.
Switching preserves position, speed, and play/pause state.
The selected recording's `currentTime` drives every score cursor and the footer;
the MIDI engine is paused. Switching back seeks the MIDI engine, restoring held
notes through its existing seek implementation.

Original audio retains its recorded tuning. Playback speed uses the browser's
pitch-preserving media playback. MIDI transposition controls are hidden while
listening to the recording. Both sources use the same master volume node.
Unavailable recordings fall back to MIDI at the same position. Browser autoplay
restrictions leave the recording selected and paused until the user presses Play.

## Prepare and publish

Audio files are hosted on the dedicated **Firebase Hosting** site
`rawlrocks-audio` in the `rawlrocks` project. Firebase Storage is not used. No
billing plan change or Storage bucket is needed.

The commands need Node (with `fetch`), FFmpeg, the existing `firebase-admin`
dependency and, for publishing, the administrator credential in
`src/config/firebaseConfigPrivate.json` (or `--credentials PATH`). Never copy that
credential into public assets or commit it.

```
node scripts/rawl/prepare-original-audio.cjs \
  --input /absolute/path/source.m4a \
  --output /absolute/path/trimmed.m4a \
  --offset 0.22937 --duration 305.47687 \
  --midi-id Y1pBHNgpwhZJCzLIvaCm \
  --midi-sha256 90008f62cb7867dc49cd33f884ea4ad1e157151740d32e4d603153c8dcebe2ac \
  --source-url https://www.youtube.com/watch?v=DkMnJlIBa7A
```

Preparation writes a sample-trimmed AAC/MP4 recording and a JSON report. The input
is decoded before trimming, with no packet-level seeking. The tail is trimmed or
silence-padded to the MIDI duration; sample rate and channel count are preserved.
Verify alignment against the audio used to time the transcription before publishing.

Create a JSON manifest array whose entries have `key` and `report` (absolute path
to the preparation report), then publish:

```
node scripts/rawl/publish-original-audio.cjs \
  --manifest /absolute/path/manifest.json --site rawlrocks-audio
```

The publisher preserves the dedicated site's existing files and adds immutable
content-addressed audio paths with CORS and audio content-type headers. It refuses
the project's default Hosting site. It verifies each public file's SHA-256 and
CORS, checks the MIDI SHA-256, then transactionally attaches `originalAudio` to
that MIDI document. Concurrent MIDI, audio-link, or Hosting release edits abort
publication. MIDI blobs, the MIDI index, and annotations are never edited.
The `storagePath` metadata field is the path on Firebase Hosting, not a bucket key.

## Sunbati publication (2026-10-31)

All six recordings and their verified links are published. Prepared files, exact
commands, and publication reports are in the companion workspace's
`sunbati/audio-sync/`. Nahawand uses the same WebM source as its transcription,
trimmed by 8.44 seconds. The other five use their original M4A sources and manifest
offsets. Source pitch is unchanged; the MIDI's common tuning shifts are not
applied to the original audio.

Five independent one-second windows in each recording, spread from opening to
ending, match the analysis source to within one 22050 Hz sample (0.046 ms), with
correlations above 0.985. This verifies recording trim and clock; it does not
claim that every draft transcription attack is correct.

Checks: `node --test scripts/rawl/original-audio.test.cjs`, `tsc --noEmit`, Chrome
source switching while paused/playing, seeks, 0.9x playback, and console review.
Temporary local metadata/media used for initial testing were removed. Final
browser verification uses the published Firebase Hosting recording through the
normal Firestore loading path.

Frontend deployed to rawl.rocks on 2026-10-31 in GitHub Pages commit
`4d5903d322f28382431596087e8abbd38262d8ff` (successful run `41217760221`). All six
public pages default to the original recording and play it with no console
errors. Sekah also passes source switching, seeking and 0.9x playback. Public
entry files and bundles match the release hashes; the previous MIDI worker and
global CSS are byte-identical. All 12 bundled JSON values and both corpus arrays
match the prior production version exactly. Evidence is in the companion
workspace's `sunbati/audio-sync/production-*.json` and `production-sekah.jpg`.
