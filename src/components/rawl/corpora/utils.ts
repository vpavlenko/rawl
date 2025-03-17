import { titleCase } from "title-case";

export const beautifySlug = (slug: string): string => {
  return titleCase(
    slug.replace(/---/g, " – ").replace(/-/g, " ").replace(/_/g, " "),
  );
};
