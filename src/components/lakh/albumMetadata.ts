import { useEffect, useState } from "react";
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

export function useAlbumMetadata(artist?: LakhArtist): AlbumGroup[] | null {
  const slug = artist?.name === "The Beatles" ? undefined : artist?.slug;
  const [loaded, setLoaded] = useState<{ slug: string; groups: AlbumGroup[] | null } | null>(null);
  useEffect(() => {
    if (!slug) return;
    let active = true;
    if (!requests.has(slug)) {
      requests.set(slug, loadGroups(slug)
        .catch(() => {
          requests.delete(slug);
          return null;
        }));
    }
    requests.get(slug)!.then((groups) => {
      if (active) setLoaded({ slug, groups });
    });
    return () => { active = false; };
  }, [slug]);
  return loaded?.slug === slug ? loaded?.groups || null : null;
}
