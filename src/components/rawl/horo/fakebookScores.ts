import inventory from "./fakebook.json";

export const fakebookUrl =
  "https://bgko.org/wp-content/uploads/2020/06/Fakebook_Bulgarian_Music.pdf";

export const fakebookScorePath = `${process.env.PUBLIC_URL}/scores/Fakebook_Bulgarian_Music.pdf`;

export type FakebookSetting = {
  page: number;
  endPage: number;
  title: string;
  titleBg?: string;
  source?: string;
  credit?: string;
  region?: string;
  slug?: string;
  meter?: string;
  playbackBars?: number;
  sourcePitchCenter?: string;
  relatedSlug?: string;
};

export const fakebookSettings: FakebookSetting[] = inventory;

const bySlug = new Map(
  fakebookSettings.flatMap((entry) =>
    entry.slug ? [[entry.slug, entry] as const] : [],
  ),
);

export const getFakebookSetting = (slug: string) => bySlug.get(slug);

export const fakebookMidiPath = (slug: string) =>
  `${process.env.PUBLIC_URL}/midi/Bulgarian_Fakebook/${encodeURIComponent(
    slug,
  )}.mid`;
