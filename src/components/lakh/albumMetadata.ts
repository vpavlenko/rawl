import { useEffect, useMemo, useState } from "react";
import { LakhArtist } from "./catalog";

export type AlbumGroup = {
  id?: string;
  title: string;
  date: string;
  type?: string;
  cover: string | null;
  songs: { number: number; files: string[] }[];
};

const requests = new Map<string, Promise<AlbumGroup[] | null>>();
let availableArtists: Promise<string[]> | undefined;

function loadAlbumArtistSlugs(): Promise<string[]> {
  if (!availableArtists) {
    availableArtists = fetch("/lakh-albums/index.json").then(async (response) => {
      if (!response.ok) throw new Error("Album index unavailable");
      return response.json();
    }).catch((error) => {
      availableArtists = undefined;
      throw error;
    });
  }
  return availableArtists;
}

export function useAlbumArtistSlugs(): Set<string> {
  const [slugs, setSlugs] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    let active = true;
    loadAlbumArtistSlugs().then((artists) => {
      if (active) setSlugs(new Set(artists));
    }).catch(() => {
      // The directory remains usable when the album index is unavailable.
    });
    return () => { active = false; };
  }, []);
  return slugs;
}

async function loadGroups(slug: string): Promise<AlbumGroup[] | null> {
  if (!(await loadAlbumArtistSlugs()).includes(slug)) return null;
  const response = await fetch(`/lakh-albums/${encodeURIComponent(slug)}.json`);
  if (!response.ok) throw new Error("Album metadata unavailable");
  const data = await response.json();
  return Array.isArray(data.groups) ? data.groups : null;
}

type TrackSources = Map<string, { source: LakhArtist; file: string }>;
const songName = (file: string) => file.replace(/(?:\.\d+)?\.mid$/i, "");
const versionNumber = (file: string) => Number(/\.(\d+)\.mid$/i.exec(file)?.[1] || 0);

export function useAlbumMetadata(
  artist?: LakhArtist,
  trackSources?: TrackSources,
): AlbumGroup[] | null {
  const sources = artist?.name === "The Beatles" ? [] : artist
    ? Array.from(new Map([
        [artist.slug, artist],
        ...Array.from(trackSources?.values() || [], ({ source }) =>
          [source.slug, source] as const),
      ]).values())
    : [];
  const sourceKey = JSON.stringify(sources.map(({ slug }) => slug));
  const [loaded, setLoaded] = useState<{
    key: string;
    entries: { slug: string; groups: AlbumGroup[] | null }[];
  } | null>(null);
  useEffect(() => {
    const slugs: string[] = JSON.parse(sourceKey);
    if (!slugs.length) return;
    let active = true;
    Promise.all(slugs.map(async (slug) => {
      if (!requests.has(slug)) {
        requests.set(slug, loadGroups(slug).catch(() => {
          requests.delete(slug);
          return null;
        }));
      }
      return { slug, groups: await requests.get(slug)! };
    })).then((entries) => {
      if (active) setLoaded({ key: sourceKey, entries });
    });
    return () => { active = false; };
  }, [sourceKey]);

  return useMemo(() => {
    if (loaded?.key !== sourceKey) return null;
    const displayFiles = new Map<string, string>();
    trackSources?.forEach(({ source, file }, displayFile) => {
      displayFiles.set(JSON.stringify([source.slug, file]), displayFile);
    });
    const groups = new Map<string, AlbumGroup>();
    loaded.entries.forEach(({ slug, groups: sourceGroups }) => {
      sourceGroups?.forEach((sourceGroup) => {
        const key = sourceGroup.id || JSON.stringify([sourceGroup.title, sourceGroup.date]);
        if (!groups.has(key)) groups.set(key, { ...sourceGroup, songs: [] });
        const group = groups.get(key)!;
        sourceGroup.songs.forEach(({ number, files }) => {
          const mappedFiles = trackSources
            ? files.flatMap((file) => {
                const displayFile = displayFiles.get(JSON.stringify([slug, file]));
                return displayFile ? [displayFile] : [];
              })
            : files;
          if (!mappedFiles.length) return;
          let song = group.songs.find((item) =>
            item.number === number && songName(item.files[0]) === songName(mappedFiles[0]));
          if (!song) {
            song = { number, files: [] };
            group.songs.push(song);
          }
          song.files.push(...mappedFiles.filter((file) => !song!.files.includes(file)));
        });
      });
    });
    const result = Array.from(groups.values()).filter((group) => group.songs.length);
    result.forEach((group) => {
      group.songs.sort((a, b) => a.number - b.number);
      group.songs.forEach((song) => song.files.sort((a, b) =>
        versionNumber(a) - versionNumber(b) || a.localeCompare(b)));
    });
    result.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
    return result.length ? result : null;
  }, [loaded, sourceKey, trackSources]);
}
