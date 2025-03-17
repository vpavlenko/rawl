import { titleCase } from "title-case";

export const beautifySlug = (slug: string): string => {
  return titleCase(
    slug
      .replace(/-s-/g, "'s ")
      .replace(/-t-/g, "'t ")
      .replace(/-m-/g, "'m ")
      .replace(/---/g, " – ")
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(".", " ."),
  );
};
