import { Analyses, Analysis } from "./rawl/analysis";

export const ADMIN_USER_ID = "RK31rsh4tDdUGlNYQvakXW4AYbB3";
export type AnnotationVersion = {
  ownerId: string;
  author: string;
  analysis: Analysis;
};
export type AnnotationVersions = Record<
  string,
  Record<string, AnnotationVersion>
>;

export function resolveAnnotations(
  versions: AnnotationVersions,
  selections: Record<string, string>,
  userId?: string,
): { analyses: Analyses; selectedOwners: Record<string, string> } {
  const analyses: Analyses = {};
  const selectedOwners: Record<string, string> = {};
  Object.entries(versions).forEach(([key, owners]) => {
    const owner = [
      selections[key],
      userId,
      ADMIN_USER_ID,
      ...Object.keys(owners),
    ].find((id) => id && owners[id]);
    if (owner) {
      analyses[key] = owners[owner].analysis;
      selectedOwners[key] = owner;
    }
  });
  return { analyses, selectedOwners };
}
