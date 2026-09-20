import { artistShelf, artistShelves, LAKH_SHELVES } from "./artistShelves";
import { artistEra } from "./artistEras";
import {
  ROCK_POP_ERAS,
  ROCK_POP_GENRES,
  rockPopProfile,
} from "./rockPopFacets";

export const ARTIST_ERAS = ROCK_POP_ERAS;
export type ArtistEra = (typeof ARTIST_ERAS)[number]["id"];
export const ARTIST_GENRES = [
  ...ROCK_POP_GENRES,
  ...LAKH_SHELVES.filter((shelf) => shelf.id !== "rock").map((shelf) => ({
    id: `shelf-${shelf.id}` as const,
    label: shelf.label,
  })),
];
export type ArtistGenre = (typeof ARTIST_GENRES)[number]["id"];

export function artistProfile(name: string): {
  genre: ArtistGenre;
  era: ArtistEra;
  tags: string[];
} {
  const shelf = artistShelf(name);
  const rock = rockPopProfile(name);
  return {
    genre: shelf === "rock" ? rock.genre : `shelf-${shelf}`,
    era:
      shelf === "rock"
        ? rock.era
        : artistEra(name) !== "unassigned"
        ? artistEra(name)
        : rock.era,
    tags: Array.from(
      new Set([
        ...rock.tags,
        ...artistShelves(name).map(
          (id) => LAKH_SHELVES.find((shelf) => shelf.id === id)!.label,
        ),
      ]),
    ),
  };
}
