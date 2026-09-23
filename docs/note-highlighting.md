# Playback highlights

The note clock searches sections first, then a dictionary keyed by second inside
active sections. Buckets include notes sustaining through that second, so seeking
into a held note works. Very long spans use wider buckets to bound registration
memory. No global sorting or all-note reconciliation runs on the first frame or
on seeks. Leaving a section clears only that section's currently active notes.
Copies of sustained notes in other sections remain inactive.

Ordinary pitched-note highlights update their own DOM height/top on transitions.
Pitch-bend notes retain local React state because their SVG geometry depends on
highlight height. The initial clock update runs before paint. Measure lookup uses
binary search, and Rawl updates its surrounding React state only when the measure
changes. Memoized voices and measure headers receive null playback measures in
inactive sections, allowing those subtrees to skip playback updates.

Drum onsets have a second-based dictionary too, without a global sort. Crossed
onsets include the new frame's exact endpoint, and only one drawing per section
boundary registers a drum hit.

The 100 ms snippet clock lives in its own provider rather than App state or the
shared AppContext. Only previews belonging to the playing song subscribe; their
note trees are memoized while the playhead is outside the snippet's time span.

## User verification

No tests, builds, server, or browser checks were run, per AGENTS.md.

Run the index checks manually:

```sh
node scripts/rawl/check-playback-index.cjs
```

On the existing localhost:3000 server:

- Compare a large score's initial highlights and steady playback with audio.
- Seek forwards/backwards into chords and sustained notes, including across
  section boundaries. Only the section containing the playhead should light up.
- Check exact drum onsets and short hits, pause/resume, and seeking while paused.
- Check highlighting after mute/solo, hovering a voice, changing note height,
  manual remeasuring, and editing notes. Include pitch-bend notes.
- Check snippet previews, including time zero and pause/stop clearing.
- In React Profiler, steady playback within one measure should not commit Rawl,
  App, or inactive section voices/headers. Ordinary note highlights should not
  commit NoteRectangle; pitch-bend geometry updates are the intentional exception.

Browser paint/layout costs and other main-thread work can still delay a visual
frame. These changes remove playback-driven full-score reconciliation and lookup
work; they do not move DOM painting off the main thread.
