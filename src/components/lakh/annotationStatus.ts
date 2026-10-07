import { ADMIN_USER_ID, AnnotationVersions } from "../annotationVersions";

export const LAKH_ANNOTATION_COLORS = {
  manual: "#e69a3a",
  fewSections: "#ff8fbd",
  unannotated: "#ddd",
  unannotatedVersion: "#888",
  community: "#69b7ff",
};

export function lakhEntryColor({
  annotated,
  community,
  hasFewSections,
  version,
}: {
  annotated: boolean;
  community?: boolean;
  hasFewSections?: boolean;
  version?: boolean;
}) {
  return community
    ? LAKH_ANNOTATION_COLORS.community
    : !annotated
    ? version
      ? LAKH_ANNOTATION_COLORS.unannotatedVersion
      : LAKH_ANNOTATION_COLORS.unannotated
    : hasFewSections
    ? LAKH_ANNOTATION_COLORS.fewSections
    : LAKH_ANNOTATION_COLORS.manual;
}

// Curated annotations and the corpus owner's saved edits count as manual.
// Another contributor's selected version must not stand in for this owner's.
export function manualLakhAnnotation(
  versions: AnnotationVersions,
  key: string,
) {
  const analysis = versions[key]?.[ADMIN_USER_ID]?.analysis;
  const annotated = !!analysis;
  const hasFewSections = annotated && (analysis.sections?.length ?? 0) <= 1;
  return {
    annotated,
    hasFewSections,
    label: annotated
      ? hasFewSections
        ? "Manual annotation · ≤1 section"
        : "Manual annotation"
      : "No manual annotation",
    color: lakhEntryColor({ annotated, hasFewSections }),
  };
}
