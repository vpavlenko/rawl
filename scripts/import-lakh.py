#!/usr/bin/env python3
"""Package the official clean_midi.tar.gz into reproducible, Git-sized ZIPs.

Usage: python3 scripts/import-lakh.py /path/to/clean_midi.tar.gz
Only artist/track.mid entries are retained. No download runs during builds.
"""
import gzip
import shutil
import tempfile
import hashlib
import json
import pathlib
import sys
import tarfile
import zipfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUTPUT = ROOT / 'assets' / 'lakh'
LIMIT = 40 * 1024 * 1024


def main():
    archive = pathlib.Path(sys.argv[1])
    OUTPUT.mkdir(parents=True, exist_ok=True)
    # Decompress once: sorted random reads from a gzip stream would repeatedly
    # decompress the whole archive. The temporary tar supports direct seeks.
    with tempfile.TemporaryFile() as unpacked:
        with gzip.open(archive, 'rb') as compressed:
            shutil.copyfileobj(compressed, unpacked)
        unpacked.seek(0)
        package(archive, unpacked)


def package(archive, unpacked):
    artists = {}
    archives = []
    total_bytes = 0
    with tarfile.open(fileobj=unpacked, mode='r:') as source:
        members = []
        for member in source.getmembers():
            parts = pathlib.PurePosixPath(member.name).parts
            if (member.isfile() and len(parts) == 3 and parts[0] == 'clean_midi'
                    and parts[2].lower().endswith('.mid') and '..' not in parts):
                members.append(member)
        members.sort(key=lambda entry: entry.name)
        if not members:
            raise ValueError('No artist/track MIDI entries in archive')
        output = None
        try:
            for member in members:
                _, artist, track = pathlib.PurePosixPath(member.name).parts
                data = source.extractfile(member).read()
                if output is None or output.fp.tell() >= LIMIT:
                    if output:
                        output.close()
                    filename = f'clean-{len(archives) + 1:02d}.zip'
                    archives.append({'file': filename})
                    output = zipfile.ZipFile(OUTPUT / filename, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9)
                info = zipfile.ZipInfo(f'{artist}/{track}', date_time=(2016, 8, 9, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                output.writestr(info, data)
                total_bytes += len(data)
                artists.setdefault(artist, []).append(track)
        finally:
            if output:
                output.close()
    clean_count = len(members)
    supplement = OUTPUT / 'chiptune-annotations.zip'
    if supplement.exists():
        archives.append({'file': supplement.name})
        with zipfile.ZipFile(supplement) as extra:
            for entry in extra.infolist():
                artist, track = entry.filename.split('/')
                if track not in artists.setdefault(artist, []):
                    artists[artist].append(track)
                    total_bytes += entry.file_size
    track_count = sum(len(tracks) for tracks in artists.values())
    for item in archives:
        item['sha256'] = hashlib.sha256((OUTPUT / item['file']).read_bytes()).hexdigest()
    manifest = {
        'source': 'http://hog.ee.columbia.edu/craffel/lmd/clean_midi.tar.gz',
        'sourceSha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
        'cleanSubsetLicense': 'CC-BY-4.0',
        'cleanTrackCount': clean_count,
        'supplementSources': 'chiptune-sources.json',
        'trackCount': track_count,
        'artistCount': len(artists),
        'uncompressedBytes': total_bytes,
        'archives': archives,
    }
    (OUTPUT / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    catalog = {
        'trackCount': track_count,
        'artists': [{'name': name, 'tracks': sorted(tracks, key=str.casefold)}
                    for name, tracks in sorted(artists.items(), key=lambda item: item[0].casefold())],
    }
    (ROOT / 'public' / 'lakh-index.json').write_text(json.dumps(catalog, ensure_ascii=False, separators=(',', ':')) + '\n')
    analyses = json.loads((ROOT / 'src' / 'corpus' / 'analyses.json').read_text())
    available = {f'c/MIDI/{artist}/{track}' for artist, tracks in artists.items() for track in tracks}
    keys = [key for key in analyses if key.startswith('c/MIDI/')]
    missing = [key for key in keys if key not in available]
    print(json.dumps({**manifest, 'matchedAnalyses': len(keys) - len(missing), 'unmatchedAnalyses': missing}, indent=2))


if __name__ == '__main__':
    main()
