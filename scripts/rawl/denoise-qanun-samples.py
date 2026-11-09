#!/usr/bin/env python3
"""Create gentle, lossless playback derivatives from the pinned original bank.

Usage: python3 scripts/rawl/denoise-qanun-samples.py public/audio/qanun
Requires FFmpeg/ffprobe; no Python packages or trained denoising model.
Original .m4a files are verified against their hashes and remain untouched.
"""

import argparse
import hashlib
import json
from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / "public/audio/qanun"
SAMPLE_RATE = 44100
FILTER_DELAY = 1102  # afftdn's 25 ms window, verified by cross-correlation.
NOISE_REDUCTION = 6
NOISE_FLOOR = -65
GAIN_SMOOTH = 10
B3_CLEAN_END = 1.55


def run(*args):
    return subprocess.check_output(args)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Directory with original .m4a slices")
    args = parser.parse_args()
    manifest_path = BANK / "manifest.json"
    manifest = json.loads(manifest_path.read_text())
    originals = manifest.get("originalFiles", manifest["files"])
    # Validate the complete source set before replacing any derivative.
    for entry in originals:
        source = args.source / entry["file"]
        if sha256(source) != entry["sha256"]:
            raise ValueError(f"Original source hash mismatch: {source}")

    files = []
    for entry in originals:
        source = args.source / entry["file"]
        decoded = run("ffmpeg", "-v", "error", "-i", str(source), "-ac", "1",
                      "-ar", str(SAMPLE_RATE), "-f", "f32le", "-")
        source_samples = len(decoded) // 4
        samples = min(source_samples, round(B3_CLEAN_END * SAMPLE_RATE)) \
            if source.stem == "qanun-B3" else source_samples
        fade_samples = round((0.05 if source.stem == "qanun-B3" else 0.015) * SAMPLE_RATE)
        # Pad before the FFT filter, then compensate its delay exactly. This
        # preserves attack timing and the complete clean decay of other notes.
        filters = (
            f"apad=pad_len={FILTER_DELAY},"
            f"afftdn=nr={NOISE_REDUCTION}:nf={NOISE_FLOOR}:gs={GAIN_SMOOTH},"
            f"atrim=start_sample={FILTER_DELAY}:end_sample={FILTER_DELAY + samples},"
            "asetpts=N/SR/TB,"
            f"afade=t=out:ss={samples - fade_samples}:ns={fade_samples}"
        )
        output = BANK / f"{source.stem}.flac"
        subprocess.run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(source),
            "-ar", str(SAMPLE_RATE), "-ac", "1", "-af", filters,
            "-c:a", "flac", "-sample_fmt", "s32", "-compression_level", "8", str(output),
        ], check=True)
        files.append({
            "file": output.name, "sha256": sha256(output),
            "bytes": output.stat().st_size, "original": source.name,
            "samples": samples, "sampleRate": SAMPLE_RATE, "filter": filters,
        })

    manifest["originalFiles"] = originals
    manifest["files"] = files
    manifest["processing"] = {
        "date": "2026-11-09",
        "script": "scripts/rawl/denoise-qanun-samples.py",
        "command": "python3 scripts/rawl/denoise-qanun-samples.py public/audio/qanun",
        "ffmpeg": run("ffmpeg", "-version").decode().splitlines()[0],
        "noiseReductionDb": NOISE_REDUCTION, "noiseFloorDb": NOISE_FLOOR,
        "gainSmooth": GAIN_SMOOTH, "delayCompensationSamples": FILTER_DELAY,
        "endFadeSeconds": 0.015, "B3CleanEndSeconds": B3_CLEAN_END,
        "B3EndFadeSeconds": 0.05, "output": "24-bit mono FLAC, 44100 Hz",
        "normalization": False, "retuning": False,
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Created {len(files)} lossless derivatives; originals preserved.")


if __name__ == "__main__":
    main()
