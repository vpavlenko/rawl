# Qanun sample bank

Original recording: [kanun_moderate_Chromatic_moreIsolated.mp3](https://freesound.org/people/barisbozkurt/sounds/211133/)
by **barisbozkurt** (Barış Bozkurt), released under
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

The 18 isolated-note slices (F3–D♯6) come from the
[joetessy/qanun bank](https://github.com/joetessy/qanun/tree/781775a018735ba9e7f83f9d84d8ef326bcbc5f2/public/samples/qanun),
pinned to revision `781775a018735ba9e7f83f9d84d8ef326bcbc5f2`.
The upstream `NOTICE.md` is preserved verbatim beside this file.
`manifest.json` records the original and processed file sizes and SHA-256 hashes.

Retrieved 2026-11-09. The original `.m4a` slices remain byte-identical.
Playback uses gentle denoised, 24-bit lossless `.flac` derivatives, produced on
2026-11-09 with `scripts/rawl/denoise-qanun-samples.py` and FFmpeg's `afftdn`:
6 dB maximum noise reduction, -65 dB noise floor, gain smoothing radius 10.
The filter's measured 1102-sample delay is compensated; padding preserves the
original clean duration. Every output has a 15 ms end fade. B3 contains a
broadband noise burst at its original end, so its derivative ends at 1.55 s,
with a 50 ms fade before that cut. No gain normalization or retuning is applied.
The FLAC derivatives avoid another generation of lossy encoding.

Reproduce from the retained originals with:

```sh
python3 scripts/rawl/denoise-qanun-samples.py public/audio/qanun
```

The script verifies original hashes before processing. Exact FFmpeg version,
per-file filter commands, sample counts and hashes are in `manifest.json`.
The before/after signal audit is in
`reports/maqam-reference-2026-11-09/qanun-denoise-audit.json`.

The player selects the nearest recorded note and applies a playback-rate ratio
for the target pitch, including the per-sample base-pitch correction recorded in
`src/sampler/qanunTuning.json` (A4 = 440 Hz). The same integer-cent corrections
are encoded in the SoundFont's fineTune generators. The original and cleaned
recordings are not rewritten for calibration. Measured source frequencies,
hashes and correction values are retained in that shared table; the builder
rejects calibration whose source hashes no longer match. The reproducible
71-pitch output audit is recorded in
`reports/maqam-reference-2026-11-09/qanun-tuning-audit.json`.

Every note in the eight book figures, including lower
auxiliaries and quarter tones, is within one semitone of a recorded sample.
Each note plays one recorded pluck, without tremolo, loops, or synthetic attacks.
The reference now plays in the printed register rather than the previous oud
preview's octave-lowered register.

Arabic score MIDI playback uses a SoundFont built from these same
cleaned recordings. `soundfont.json` records the exact source/output hashes,
key ranges and level calibration. Generate it with
`python3 scripts/rawl/build-qanun-soundfont.py`. All melodic programs use qanun;
percussion presets are retained from the app's bundled `2MBGMGS.SF2`, whose
original SoundFont INFO metadata is preserved in the derivative. Legacy
reserved generator 39 is omitted because the synth already ignores it.
The generated bank is CC0 qanun plus the bundled GM percussion, retaining
their respective source notices. Each qanun sample is peak-calibrated to 0.85
without compression; sampler and MIDI mix gains are in
`src/sampler/qanunLevels.json`. The FLAC source derivatives are not normalized.
