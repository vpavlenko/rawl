# IV flute balance, user follow-up

Scope: bars1–8 and17–24. Source PDF80–82 identifies solo Flute1 and first/second string desks. Bar17 resumes bowed short-note accompaniment; the prior rendered string ensemble overpowered the flute.

Local CC11 expression multiplier: Flute1.26 in1–8 and17–24; ViolinI/II, Viola and Cello.60 only in17–24. Gains carry through release gaps and recompute at the next attack. Ordinary source dynamics, articulation, velocity, pitches, durations, instrument programs and tempo are unchanged. The six other MIDI files are byte-identical. The fourth differs only in CC11 events.

Actual packaged Rawl WASM/SoundFont rendering: flute approximately+4.0dB in both passages; summed strings unchanged in1–8 and approximately-8.8dB in17–24. Flute versus summed strings changes from+2.1 to+6.1dB in1–8, and-6.2 to+6.7dB in17–24. Peak mix remains below.16 at renderer unity. These are electrical RMS measurements, not a perceptual loudness or exact reference stem estimate.

Spectrogram-comparison.png compares the Frankfurt recording with before/after MIDI, using shared spectral limits and independently normalized window RMS. Audio-to-bar alignment is approximate. Reference timbre differs from GM and cannot determine exact individual stem gains. Source and rendered flute pitch register agree; adjustment concerns balance.

Verification: comparison.py asserts all non-CC11 events unchanged and other six hashes unchanged. MIDI structure validation passes. The actual Rawl transform/parser/sequencer/WASM checks pass for revised IV. comparison.json contains measured gains; browser and public readback are saved after publication.
