import { formatComposerName, hasMetadata } from "../corpusUtils";
import { TOP_100_COMPOSERS } from "../top100Composers";
import { corpora } from "./corpora";

export const getComposerInfo = (midiSlug: string) => {
  const eligible = corpora.filter(
    (corpus) => !corpus.secondary && corpus.composerName !== null,
  );
  const credit = TOP_100_COMPOSERS.find((entry) => entry.slug === midiSlug);
  const creditedComposer =
    credit &&
    eligible.find(
      (corpus) =>
        (
          corpus.composerName || formatComposerName(corpus.slug)
        ).toLowerCase() === credit.composer.toLowerCase(),
    );
  if (creditedComposer) return creditedComposer;
  const matches = eligible.filter((corpus) => corpus.midis.includes(midiSlug));
  // Prefer a dated composer over a broader collection with genre metadata.
  return (
    matches.find((corpus) => typeof corpus.composerBirthYear === "number") ||
    matches.find(hasMetadata) ||
    null
  );
};
