import type { LakhCatalog, LakhArtist } from "../components/lakh/catalog";
import { canonicalArtistName } from "../components/lakh/artistShelves";
export const versionTitle = (file: string) =>
  file.replace(/(?:\.\d+)?\.mid$/i, "");
export const normalizedVersionTitle = (file: string) =>
  versionTitle(file)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
export function versionGroupId(artist: string, file: string) {
  let title = normalizedVersionTitle(file);
  if (canonicalArtistName(artist) === "The Beatles")
    title =
      {
        elenorrigby: "eleanorrigby",
        foolonthehill: "thefoolonthehill",
        mailmanbringmenomoreblues: "mailmanbringmenoblues",
      }[title] || title;
  return `${canonicalArtistName(artist)}/${title}`;
}
export function versionGroups(catalog: LakhCatalog) {
  const groups = new Map<
    string,
    { artist: LakhArtist; file: string; key: string }[]
  >();
  for (const artist of catalog.artists)
    for (const file of artist.tracks) {
      const id = versionGroupId(artist.name, file);
      if (!groups.has(id)) groups.set(id, []);
      groups
        .get(id)
        .push({ artist, file, key: `c/MIDI/${artist.name}/${file}` });
    }
  return groups;
}
