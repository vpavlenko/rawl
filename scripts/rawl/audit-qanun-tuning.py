#!/usr/bin/env python3
"""Measure source, preview-resampled and actual FluidSynth qanun pitches.

Requires FFmpeg, NumPy and SciPy. First render the production SoundFont:
  node scripts/rawl/render-qanun-tuning.cjs /private/tmp/rawl-qanun-tuning
  python3 scripts/rawl/audit-qanun-tuning.py /private/tmp/rawl-qanun-tuning REPORT.json
This is spectral analysis, with no trained model or source-audio mutation.
"""
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys
import numpy as np
from scipy.fft import rfft, next_fast_len
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[2]
SR = 44100


def nominal(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def measure(pcm, midi, rate=1):
    # Keep the same source-time window after resampling. Fixed output-time
    # windows can select a different beating string/partial in the decay.
    start = round(.08 * SR / rate)
    end = min(round(.8 * SR / rate), len(pcm) - round(.025 * SR / rate))
    signal = pcm[start:end]
    size = next_fast_len(len(signal) * 16)
    spectrum = np.abs(rfft((signal - signal.mean()) * np.hanning(len(signal)), n=size))
    target = nominal(midi)
    lo = math.ceil(target * 2 ** (-80 / 1200) * size / SR)
    hi = math.floor(target * 2 ** (80 / 1200) * size / SR)
    peaks, _ = find_peaks(spectrum[lo:hi])
    if not len(peaks):
        raise ValueError(f"No fundamental peak for MIDI {midi}")
    index = lo + max(peaks, key=lambda i: spectrum[lo + i])
    a, b, c = np.log(np.maximum(spectrum[index - 1:index + 2], 1e-20))
    offset = .5 * (a - c) / (a - 2 * b + c)
    hz = (index + offset) * SR / size
    return {"midi": midi, "nominalHz": round(target, 5), "measuredHz": round(hz, 5),
            "offsetCents": round(1200 * math.log2(hz / target), 3)}


def main():
    directory = Path(sys.argv[1])
    output = Path(sys.argv[2])
    tuning = json.loads((ROOT / "src/sampler/qanunTuning.json").read_text())
    bank = json.loads((ROOT / "public/audio/qanun/soundfont.json").read_text())
    rendering = json.loads((directory / "render.json").read_text())
    assert rendering["font"]["sha256"] == bank["sha256"]
    assert hashlib.sha256((ROOT / "public" / bank["file"]).read_bytes()).hexdigest() == bank["sha256"]
    buffers = {}
    sources = []
    for sample in tuning["samples"]:
        path = ROOT / "public/audio/qanun" / sample["file"]
        assert hashlib.sha256(path.read_bytes()).hexdigest() == sample["sha256"]
        raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(path),
                                       "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
        pcm = np.frombuffer(raw, dtype="<f4")
        buffers[sample["file"]] = pcm
        sources.append({**measure(pcm, sample["midi"]), "file": sample["file"],
                        "sha256": sample["sha256"], "correctionCents": sample["correctionCents"]})
    preview = []
    synth = []
    for midi in rendering["notes"]:
        sample = min(tuning["samples"], key=lambda item: abs(item["midi"] - midi))
        pcm = buffers[sample["file"]]
        rate = 2 ** ((midi - sample["midi"] + sample["correctionCents"] / 100) / 12)
        # The sampler's exact rate, independently resampled for frequency analysis.
        positions = np.arange(0, len(pcm) - 1, rate)
        resampled = np.interp(positions, np.arange(len(pcm)), pcm)
        preview.append({**measure(resampled, midi, rate), "source": sample["file"]})
        zone = next(s for s in bank["samples"] if s["keyRange"][0] <= math.floor(midi) <= s["keyRange"][1])
        rate = 2 ** ((midi - zone["midi"] + zone["tuningCorrectionCents"] / 100) / 12)
        count = round(zone["pcmSamples"] / rate)
        rendered = np.fromfile(directory / f"midi-{midi}.f32", dtype="<f4").reshape(-1, 2).mean(axis=1)[:count]
        synth.append({**measure(rendered, midi, rate), "source": zone["file"]})
    worst = {name: max(abs(n["offsetCents"]) for n in notes)
             for name, notes in [("preview", preview), ("soundfont", synth)]}
    report = {"reference": "A4=440 Hz; intentional half-semitones remain exactly 50 cents",
              "method": tuning["method"], "sampleRate": SR, "font": rendering["font"],
              "commands": ["node scripts/rawl/render-qanun-tuning.cjs OUTPUT_DIRECTORY",
                           "python3 scripts/rawl/audit-qanun-tuning.py OUTPUT_DIRECTORY REPORT.json"],
              "dependencies": {"numpy": np.__version__, "scipy": __import__('scipy').__version__,
                               "ffmpeg": subprocess.check_output(['ffmpeg', '-version'], text=True).splitlines()[0]},
              "limitations": "Dominant fundamental calibration over matching source-time windows preserves natural beating, inharmonicity and within-note drift; it does not force every instantaneous partial to concert pitch. Preview waveform uses independent linear resampling; browser scheduler rate is also covered by playback tests. Synth measurements use production WASM.",
              "sourceSamples": sources, "previewNotes": preview, "soundfontNotes": synth,
              "maxAbsoluteOffsetCents": worst, "toleranceCents": 1.0,
              "synthMessages": rendering["errors"]}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(worst))
    for midi in [60, 72, 74, 84]:
        print(next(row for row in synth if row["midi"] == midi))
    assert all(error <= 1 for error in worst.values()), worst


if __name__ == "__main__":
    main()
