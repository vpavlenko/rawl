import { Analysis } from "./analysis";

export function getSectionAnchors(
  analysis: Analysis,
  phraseStarts: number[],
  measures: number[],
): NonNullable<Analysis["sectionAnchors"]> {
  const sections = analysis.sections ?? [0];
  const anchors: NonNullable<Analysis["sectionAnchors"]> = {};
  Object.entries(analysis.sectionAnchors ?? {}).forEach(([source, anchor]) => {
    const sourceIndex = sections.indexOf(Number(source));
    const targetIndex = sections.indexOf(anchor.section);
    if (
      sourceIndex < 0 || targetIndex < 0 ||
      Math.abs(sourceIndex - targetIndex) !== 1 ||
      !Number.isInteger(anchor.phrase) ||
      anchor.phrase < anchor.section ||
      anchor.phrase >= (sections[targetIndex + 1] ?? phraseStarts.length) ||
      !Number.isFinite(measures[phraseStarts[Number(source)] - 1]) ||
      !Number.isFinite(measures[phraseStarts[anchor.phrase] - 1]) ||
      phraseStarts[anchor.phrase] >= measures.length
    ) return;
    anchors[Number(source)] = anchor;
  });
  // Imported annotations may contain cycles. Ignore every link in a cycle.
  Object.keys(anchors).forEach((key) => {
    const path: number[] = [];
    let current = Number(key);
    while (anchors[current]) {
      const cycleStart = path.indexOf(current);
      if (cycleStart !== -1) {
        path.slice(cycleStart).forEach((section) => delete anchors[section]);
        break;
      }
      path.push(current);
      current = anchors[current].section;
    }
  });
  return anchors;
}

// Offsets are in seconds so alignment survives horizontal zoom changes.
export function getSectionOffsets(
  analysis: Analysis,
  phraseStarts: number[],
  measures: number[],
): Record<number, number> {
  const anchors = getSectionAnchors(analysis, phraseStarts, measures);
  const offsets: Record<number, number> = {};
  const resolve = (section: number): number => {
    if (offsets[section] !== undefined) return offsets[section];
    const anchor = anchors[section];
    return offsets[section] = anchor
      ? resolve(anchor.section) + measures[phraseStarts[anchor.phrase] - 1] -
        measures[phraseStarts[anchor.section] - 1]
      : 0;
  };
  (analysis.sections ?? [0]).forEach(resolve);
  return offsets;
}

export function setSectionAnchor(
  analysis: Analysis,
  phraseStarts: number[],
  measures: number[],
  source: number,
  anchor: { section: number; phrase: number } | null,
): NonNullable<Analysis["sectionAnchors"]> {
  const anchors = getSectionAnchors(analysis, phraseStarts, measures);
  delete anchors[source];
  if (anchor) {
    // Reversing the direction of an existing dependency releases the target
    // before attaching the selected section, keeping the layout acyclic.
    let current = anchor.section;
    while (anchors[current]) {
      current = anchors[current].section;
      if (current === source) {
        delete anchors[anchor.section];
        break;
      }
    }
    anchors[source] = anchor;
  }
  return getSectionAnchors({ ...analysis, sectionAnchors: anchors }, phraseStarts, measures);
}

// Shared by the keyboard controls and their inline target labels.
export function getSectionAnchorShiftTarget(
  current: Analysis,
  phrases: number[],
  measures: number[],
  selectedMeasure: number,
  neighbor: -1 | 1,
  direction: -1 | 1,
): number | null | undefined {
  const sections = current.sections ?? [0];
  const source = phrases.indexOf(selectedMeasure);
  const sourceIndex = sections.indexOf(source);
  if (sourceIndex < 0) return undefined;
  const targetIndex = sourceIndex + neighbor;
  const target = sections[targetIndex];
  if (target === undefined) return undefined;
  const offsets = getSectionOffsets(current, phrases, measures);
  // Use the target's position after releasing any reverse dependency.
  const prospective = {
    ...current,
    sectionAnchors: setSectionAnchor(current, phrases, measures, source,
      { section: target, phrase: target }),
  };
  const targetOffset = getSectionOffsets(prospective, phrases, measures)[target];
  const candidates = phrases.map((measure, phrase) => ({
    phrase, x: targetOffset + measures[measure - 1] - measures[phrases[target] - 1],
  })).filter(({ phrase }) => phrase >= target &&
    phrase < (sections[targetIndex + 1] ?? phrases.length) && phrases[phrase] < measures.length);
  const next = direction === 1
    ? candidates.find(({ x }) => x > offsets[source] + 1e-6)
    : candidates.slice().reverse().find(({ x }) => x < offsets[source] - 1e-6);
  if (next) return next.phrase;
  if (direction === -1 && offsets[source] > 0) return null;
  return undefined;
}
