import type { CorpusEntry, CorpusSection } from "./corpora";

export type ResolvedCorpusSection = CorpusSection & {
  startIndex: number;
  count: number;
};

export const getCorpusSections = (
  corpus: Pick<CorpusEntry, "midis" | "sections">,
): ResolvedCorpusSection[] => {
  const sections = (corpus.sections || [])
    .map((section) => ({
      ...section,
      startIndex: corpus.midis.indexOf(section.startsAtMidi),
    }))
    .filter((section) => section.startIndex >= 0)
    .sort((a, b) => a.startIndex - b.startIndex);

  return sections.map((section, index) => ({
    ...section,
    count:
      (sections[index + 1]?.startIndex ?? corpus.midis.length) -
      section.startIndex,
  }));
};
