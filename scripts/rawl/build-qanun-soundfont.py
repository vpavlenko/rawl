#!/usr/bin/env python3
"""Package the cleaned qanun recordings for the existing MIDI synthesizers.

All bank-0 programs share one qanun instrument. Retain the bundled GM bank's
percussion kits. Shared per-sample tuning and peak levels are applied as
SoundFont metadata/gain; cleaned source recordings remain unchanged.
Requires FFmpeg; run from any directory with Python 3.
"""
import hashlib
import json
from pathlib import Path
import struct
import subprocess
from array import array

ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / "public/audio/qanun"
GM = ROOT / "public/2MBGMGS.SF2"


def chunks(data):
    offset = 0
    while offset + 8 <= len(data):
        key, size = struct.unpack_from("<4sI", data, offset)
        yield key, data[offset + 8:offset + 8 + size]
        offset += 8 + size + size % 2


def chunk(key, data):
    return key + struct.pack("<I", len(data)) + data + b"\0" * (len(data) % 2)


def records(data, size):
    return [data[i:i + size] for i in range(0, len(data), size)]


def name(text):
    return text.encode("ascii")[:19].ljust(20, b"\0")


def gen(operator, amount):
    return struct.pack("<HH", operator, amount & 65535)


def main():
    manifest = json.loads((BANK / "manifest.json").read_text())
    levels = json.loads((ROOT / "src/sampler/qanunLevels.json").read_text())
    tuning = json.loads((ROOT / "src/sampler/qanunTuning.json").read_text())
    # LIST chunks share their tag; identify them by their four-byte list type.
    lists = {data[:4]: data[4:] for key, data in chunks(GM.read_bytes()[12:]) if key == b"LIST"}
    info, sdta, pdta = (dict(chunks(lists[key])) for key in [b"INFO", b"sdta", b"pdta"])
    pcm = bytearray(sdta[b"smpl"])
    headers = records(pdta[b"shdr"], 46)[:-1]
    instruments = records(pdta[b"inst"], 22)[:-1]
    ibags = records(pdta[b"ibag"], 4)[:-1]
    igens = records(pdta[b"igen"], 4)[:-1]
    imod_end = len(pdta[b"imod"]) // 10 - 1
    qanun_instrument = len(instruments)
    instruments.append(name("Clean qanun") + struct.pack("<H", len(ibags)))
    pitches = [sample["midi"] for sample in tuning["samples"]]
    inputs = []
    for index, pitch in enumerate(pitches):
        label = ["C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs", "A", "As", "B"][pitch % 12]
        filename = f"qanun-{label}{pitch // 12 - 1}.flac"
        entry = next(entry for entry in manifest["files"] if entry["file"] == filename)
        calibration = tuning["samples"][index]
        if calibration["file"] != filename or calibration["sha256"] != entry["sha256"]:
            raise ValueError(f"Stale tuning calibration: {filename}")
        correction = calibration["correctionCents"]
        if not isinstance(correction, int) or not -99 <= correction <= 99:
            raise ValueError(f"Invalid tuning correction: {filename}")
        source = BANK / filename
        if hashlib.sha256(source.read_bytes()).hexdigest() != entry["sha256"]:
            raise ValueError(f"Clean sample hash mismatch: {source}")
        decoded = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(source),
                                           "-ac", "1", "-ar", "44100", "-f", "f32le", "-"])
        floats = array("f")
        floats.frombytes(decoded)
        sample_gain = levels["samplePeak"] / max(abs(sample) for sample in floats)
        raw = array("h", (round(sample * sample_gain * 32767) for sample in floats)).tobytes()
        start = len(pcm) // 2
        end = start + len(raw) // 2
        pcm.extend(raw + b"\0" * 92)  # SoundFont's 46 silent guard samples.
        sample_id = len(headers)
        headers.append(name(source.stem) + struct.pack("<IIIIIBbHH", start, end, start,
                                                       end, 44100, pitch, 0, 0, 1))
        low = 0 if index == 0 else (pitches[index - 1] + pitch) // 2 + 1
        high = 127 if index == len(pitches) - 1 else (pitch + pitches[index + 1]) // 2
        ibags.append(struct.pack("<HH", len(igens), imod_end))
        # Three-millisecond attack and a two-second release let each unlooped
        # recording ring naturally after short note-offs, as in the reference.
        igens.extend([gen(43, low | high << 8), gen(34, -10057), gen(38, 1200),
                      gen(52, correction), gen(54, 0), gen(58, pitch), gen(53, sample_id)])
        inputs.append({"file": filename, "sha256": entry["sha256"], "midi": pitch,
                       "keyRange": [low, high], "pcmSamples": len(raw) // 2,
                       "gain": sample_gain, "tuningCorrectionCents": correction})
    instruments.append(name("EOI") + struct.pack("<H", len(ibags)))
    ibags.append(struct.pack("<HH", len(igens), imod_end))
    igens.append(gen(0, 0))
    headers.append(name("EOS") + struct.pack("<IIIIIBbHH", *([len(pcm) // 2] * 4), 44100, 0, 0, 0, 1))

    # Rebuild the preset directory; preserve complete percussion zones and
    # their modulators while pointing all 128 bank-0 programs at the qanun.
    old_headers = records(pdta[b"phdr"], 38)
    old_bags = [struct.unpack("<HH", item) for item in records(pdta[b"pbag"], 4)]
    presets = []
    for program in range(128):
        presets.append((0, program, "Qanun", [(gen(41, qanun_instrument), b"")]))
    for index, header in enumerate(old_headers[:-1]):
        program, bank, begin = struct.unpack_from("<HHH", header, 20)
        if bank != 128:
            continue
        end = struct.unpack_from("<H", old_headers[index + 1], 24)[0]
        zones = []
        for bag in range(begin, end):
            g, m = old_bags[bag]
            next_g, next_m = old_bags[bag + 1]
            zones.append((pdta[b"pgen"][g * 4:next_g * 4], pdta[b"pmod"][m * 10:next_m * 10]))
        presets.append((bank, program, header[:20].rstrip(b"\0").decode("ascii"), zones))
    phdr, pbag, pgen, pmod = bytearray(), bytearray(), bytearray(), bytearray()
    for bank, program, title, zones in sorted(presets):
        phdr.extend(name(title) + struct.pack("<HHHIII", program, bank, len(pbag) // 4, 0, 0, 0))
        for generators, modulators in zones:
            pbag.extend(struct.pack("<HH", len(pgen) // 4, len(pmod) // 10))
            pgen.extend(generators)
            pmod.extend(modulators)
    phdr.extend(name("EOP") + struct.pack("<HHHIII", 0, 0, len(pbag) // 4, 0, 0, 0))
    pbag.extend(struct.pack("<HH", len(pgen) // 4, len(pmod) // 10))
    pgen.extend(gen(0, 0))
    pmod.extend(b"\0" * 10)

    # Keep only referenced instruments. Unused melodic GM instruments include
    # unsupported legacy generators and have no role in this qanun bank.
    used = sorted({struct.unpack_from("<H", pgen, offset + 2)[0]
                   for offset in range(0, len(pgen), 4)
                   if struct.unpack_from("<H", pgen, offset)[0] == 41})
    remap = {old: new for new, old in enumerate(used)}
    for offset in range(0, len(pgen), 4):
        if struct.unpack_from("<H", pgen, offset)[0] == 41:
            old = struct.unpack_from("<H", pgen, offset + 2)[0]
            struct.pack_into("<H", pgen, offset + 2, remap[old])
    old_ibags = [struct.unpack("<HH", bag) for bag in ibags]
    old_igens = b"".join(igens)
    new_inst, new_ibag, new_igen, new_imod = [], [], bytearray(), bytearray()
    for old in used:
        new_inst.append(instruments[old][:20] + struct.pack("<H", len(new_ibag)))
        begin = struct.unpack_from("<H", instruments[old], 20)[0]
        end = struct.unpack_from("<H", instruments[old + 1], 20)[0]
        for bag in range(begin, end):
            g, m = old_ibags[bag]
            next_g, next_m = old_ibags[bag + 1]
            new_ibag.append(struct.pack("<HH", len(new_igen) // 4, len(new_imod) // 10))
            for offset in range(g * 4, next_g * 4, 4):
                # Legacy CM-64 drums contain reserved generator 39, which the
                # synth already ignores with a warning. Omit that no-op.
                if struct.unpack_from("<H", old_igens, offset)[0] != 39:
                    new_igen.extend(old_igens[offset:offset + 4])
            new_imod.extend(pdta[b"imod"][m * 10:next_m * 10])
    new_inst.append(name("EOI") + struct.pack("<H", len(new_ibag)))
    new_ibag.append(struct.pack("<HH", len(new_igen) // 4, len(new_imod) // 10))
    new_igen.extend(gen(0, 0))
    new_imod.extend(b"\0" * 10)
    pdta.update({b"phdr": phdr, b"pbag": pbag, b"pmod": pmod, b"pgen": pgen,
                 b"inst": b"".join(new_inst), b"ibag": b"".join(new_ibag),
                 b"igen": new_igen, b"imod": new_imod, b"shdr": b"".join(headers)})
    info[b"INAM"] = b"Rawl clean qanun with GM percussion\0"
    payload = b"sfbk" + b"".join([
        chunk(b"LIST", b"INFO" + b"".join(chunk(key, value) for key, value in info.items())),
        chunk(b"LIST", b"sdta" + chunk(b"smpl", pcm)),
        chunk(b"LIST", b"pdta" + b"".join(chunk(key, pdta[key]) for key in
            [b"phdr", b"pbag", b"pmod", b"pgen", b"inst", b"ibag", b"imod", b"igen", b"shdr"])),
    ])
    output = chunk(b"RIFF", payload)
    digest = hashlib.sha256(output).hexdigest()
    filename = f"rawl-qanun-{digest[:12]}.sf2"
    (ROOT / "public" / filename).write_bytes(output)
    (ROOT / "src/players/qanunSoundfont.json").write_text(json.dumps({"file": filename, "sha256": digest}, indent=2) + "\n")
    (BANK / "soundfont.json").write_text(json.dumps({
        "file": filename, "sha256": digest, "bytes": len(output),
        "builder": "scripts/rawl/build-qanun-soundfont.py",
        "command": "python3 scripts/rawl/build-qanun-soundfont.py",
        "base": {"file": GM.name, "sha256": hashlib.sha256(GM.read_bytes()).hexdigest()},
        "samples": inputs, "bank0": "All 128 programs use cleaned qanun",
        "percussion": "Original GM bank-128 percussion kits retained", "loops": False,
        "levels": levels, "tuning": tuning,
    }, indent=2) + "\n")
    print(filename)


if __name__ == "__main__":
    main()
