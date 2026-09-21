#!/usr/bin/env python3
"""Cache MusicBrainz discographies and match Lakh songs; resumable, no dependencies."""
import argparse
import difflib
import hashlib
import json
from pathlib import Path
import re
import time
import unicodedata
import urllib.parse
import urllib.request
import urllib.error

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / 'scripts/untracked/musicbrainz-cache'
OUT = ROOT / 'public/lakh-albums'
REPORTS = ROOT / 'assets/lakh/musicbrainz'
USER_AGENT = 'RawlAlbumPreprocessor/1.0 (https://github.com/vpavlenko/chiptheory)'
last_request = 0.0


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)


def fetch(endpoint, **params):
    global last_request
    url = 'https://musicbrainz.org/ws/2/' + endpoint + '?' + urllib.parse.urlencode(dict(params, fmt='json'))
    path = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.json')
    if path.exists():
        return json.loads(path.read_text())
    for attempt in range(5):
        time.sleep(max(0, 1.1 - (time.monotonic() - last_request)))
        last_request = time.monotonic()
        try:
            request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
            with urllib.request.urlopen(request, timeout=45) as response:
                result = json.load(response)
            write(path, result)
            return result
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 4:
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError(url)


def browse(entity, key, **params):
    result = []
    while True:
        page = fetch(entity, limit=100, offset=len(result), **params)
        items = page[key]
        result.extend(items)
        if not items or len(result) >= page[entity + '-count']:
            return result


def title(file):
    return re.sub(r'(?:\.\d+)?\.mid$', '', file, flags=re.I)


def normalize(value):
    value = unicodedata.normalize('NFKD', value.casefold())
    return ''.join(c for c in value if c.isalnum() and not unicodedata.combining(c))


def process(artist, config):
    name = artist['name']
    settings = config.get(name, {})
    if settings.get('skip'):
        print(name + ': skipped — ' + settings['skip'], flush=True)
        return
    identity = settings.get('mbid')
    if not identity:
        query = settings.get('name', name)
        candidates = fetch('artist', query='artist:"' + query.replace('"', '') + '"', limit=10)['artists']
        matches = [a for a in candidates if normalize(a['name']) == normalize(query)]
        if len(matches) != 1:
            write(REPORTS / (artist['slug'] + '.json'), {'artist': name, 'status': 'needs-artist-id', 'candidates': candidates})
            print(name + ': ambiguous artist; see report', flush=True)
            return
        identity = matches[0]['id']
        settings = dict(settings, mbid=identity, country=matches[0].get('country'))
        config[name] = settings
        write(REPORTS / 'overrides.json', config)
    print(name + ': fetching releases for ' + identity, flush=True)
    groups = browse('release-group', 'release-groups', artist=identity, inc='artist-credits')
    # Composer credits and guest appearances can bring in other performers' albums.
    groups = [g for g in groups if next(
        (credit['artist']['id'] for credit in g.get('artist-credit', []) if isinstance(credit, dict) and 'artist' in credit),
        None,
    ) == identity]
    allowed_secondary = set(settings.get('allowedSecondaryTypes', []))
    excluded_groups = set(settings.get('excludedReleaseGroups', []))
    groups = [g for g in groups if g.get('primary-type') in ('Album', 'Single', 'EP')
              and set(g.get('secondary-types', [])) <= allowed_secondary
              and g['id'] not in excluded_groups and g.get('first-release-date')]
    # Albums take precedence over singles/EPs; within each category choose earliest.
    groups.sort(key=lambda g: (g.get('primary-type') != 'Album', g['first-release-date'], g['id']))
    albums = []
    candidates = {}
    for index, group in enumerate(groups):
        releases = browse('release', 'releases', **{'release-group': group['id']})
        releases = [r for r in releases if r.get('status') == 'Official' and r.get('date')]
        if not releases:
            continue
        release = min(releases, key=lambda r: (
            bool(settings.get('country')) and r.get('country') != settings['country'],
            r['date'], r['id'],
        ))
        release_id = settings.get('releaseOverrides', {}).get(group['id'])
        if release_id:
            release = next(r for r in releases if r['id'] == release_id)
        data = fetch('release/' + release['id'], inc='recordings')
        album = {'id': group['id'], 'releaseId': release['id'], 'title': group['title'], 'date': group['first-release-date'], 'type': group['primary-type'], 'cover': 'https://coverartarchive.org/release-group/' + group['id'] + '/front-250', 'songs': []}
        albums.append(album)
        position = 0
        for medium in sorted(data.get('media', []), key=lambda m: m.get('position', 0)):
            for track in medium.get('tracks', []):
                position += 1
                entry = {'album': album, 'number': position, 'title': track['title']}
                for key in {normalize(track['title']), normalize(track.get('recording', {}).get('title', track['title']))}:
                    candidates.setdefault(key, []).append(entry)
        print(f"  {index + 1}/{len(groups)} {group['title']}", flush=True)
    songs = {}
    for file in artist['tracks']:
        songs.setdefault(title(file), []).append(file)
    unmatched, ambiguous, matched = [], [], []
    for song, files in songs.items():
        override = settings.get('songs', {}).get(song, {})
        key = normalize(override.get('title', song))
        choices = candidates.get(key, [])
        if override.get('albumId'):
            choices = [c for c in choices if c['album']['id'] == override['albumId']]
        if not choices:
            unmatched.append(song)
            continue
        selected = choices[0]
        # Multiple positions with the same title on the chosen album require review.
        positions = {c['number'] for c in choices if c['album']['id'] == selected['album']['id']}
        if len(positions) > 1:
            ambiguous.append({'song': song, 'album': selected['album']['title'], 'positions': sorted(positions)})
            continue
        files.sort(key=lambda f: (int((re.search(r'\.(\d+)\.mid$', f, re.I) or [None, '0'])[1]), f))
        selected['album']['songs'].append({'number': selected['number'], 'files': files})
        matched.append({'song': song, 'album': selected['album']['title'], 'albumId': selected['album']['id'], 'track': selected['number']})
    albums = [a for a in albums if a['songs']]
    for album in albums:
        album['songs'].sort(key=lambda s: s['number'])
    albums.sort(key=lambda a: (a['date'], a['title']))
    write(OUT / (artist['slug'] + '.json'), {'artist': name, 'artistId': identity, 'groups': albums})
    write(OUT / 'index.json', sorted(p.stem for p in OUT.glob('*.json') if p.name != 'index.json'))
    suggestions = {song: [
        {'title': candidates[key][0]['title'], 'album': candidates[key][0]['album']['title'], 'albumId': candidates[key][0]['album']['id']}
        for key in difflib.get_close_matches(normalize(song), candidates, n=3, cutoff=0.75)
    ] for song in unmatched}
    write(REPORTS / (artist['slug'] + '.json'), {'artist': name, 'status': 'processed', 'totalSongs': len(songs), 'matched': matched, 'unmatched': unmatched, 'ambiguous': ambiguous, 'suggestions': suggestions})
    print(f'{name}: {len(matched)}/{len(songs)} matched, {len(unmatched)} unmatched, {len(ambiguous)} ambiguous', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--artist', action='append', help='Catalog name; repeat to process several artists')
    parser.add_argument('--limit', type=int, default=3, help='Top N artists by unique song count when --artist is omitted')
    args = parser.parse_args()
    config_path = REPORTS / 'overrides.json'
    config = json.loads(config_path.read_text()) if config_path.exists() else {}
    artists = json.loads((ROOT / 'public/lakh-index.json').read_text())['artists']
    artists.sort(key=lambda a: (-len({title(f) for f in a['tracks']}), a['name']))
    if args.artist:
        unknown = set(args.artist) - {a['name'] for a in artists}
        if unknown:
            parser.error('Unknown artists: ' + ', '.join(sorted(unknown)))
        artists = [a for a in artists if a['name'] in args.artist]
    else:
        artists = [a for a in artists if not config.get(a['name'], {}).get('skip')][:args.limit]
    failures = []
    for artist in artists:
        try:
            process(artist, config)
        except Exception as error:
            failures.append(artist['name'])
            print(artist['name'] + ': ERROR ' + str(error), flush=True)
    if failures:
        raise SystemExit('Failed (safe to rerun): ' + ', '.join(failures))


if __name__ == '__main__':
    main()
