import type { Analysis } from "../components/rawl/analysis";
import type { AnnotationVersions } from "../components/annotationVersions";
// Training labels come from curated annotations and the signed-in annotator's
// saved corrections. Inferred previews and other users' versions are excluded.
export function phraseTrainingSnapshot(
  curated: Record<string, Analysis>,
  versions: AnnotationVersions,
  userId?: string,
) {
  const analyses = { ...curated };
  if (userId)
    for (const [key, owners] of Object.entries(versions)) {
      const saved = owners[userId]?.analysis;
      if (saved) analyses[key] = saved;
    }
  return { format: "rawl-phrase-labels-1", analyses };
}
