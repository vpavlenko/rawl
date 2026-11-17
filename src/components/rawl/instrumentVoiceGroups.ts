// Shared instrument identity for controls and rendering. Source IDs/channels stay intact.
export type VoiceHover = number | number[] | null;

export const usesInstrumentGroups = (slug?: string, groupByInstrument = false): boolean =>
  groupByInstrument ||
  /^fazil-say-istanbul-symphony-0[1-7]-/.test(slug || "");

export function instrumentVoiceMembers(names: string[], index: number, slug?: string, groupByInstrument = false): number[] {
  if (!usesInstrumentGroups(slug, groupByInstrument) || !names[index]?.trim()) return [index];
  const name = names[index].trim();
  return names.flatMap((candidate, i) => candidate.trim() === name ? [i] : []);
}

// The lowest source member is stable across pitch sorting, muting and hover.
export function instrumentVoiceShapeIndex(names: string[], index: number, slug?: string, groupByInstrument = false): number {
  return instrumentVoiceMembers(names, index, slug, groupByInstrument)[0] ?? index;
}

export function voiceHoverContains(hover: VoiceHover, index: number): boolean {
  return Array.isArray(hover) ? hover.includes(index) : hover === index;
}

export function groupInstrumentRows<T extends { voiceIndex: number }>(
  rows: T[], names: string[], slug?: string, excluded: number[] = [], groupByInstrument = false,
): (T & { voiceMembers: number[] })[] {
  const removed = new Set(excluded);
  const seen = new Set<number>();
  const result: (T & { voiceMembers: number[] })[] = [];
  rows.forEach((row) => {
    if (removed.has(row.voiceIndex) || seen.has(row.voiceIndex)) return;
    const members = instrumentVoiceMembers(names, row.voiceIndex, slug, groupByInstrument)
      .filter((index) => !removed.has(index));
    members.forEach((index) => seen.add(index));
    result.push({ ...row, voiceMembers: members });
  });
  return result;
}

export function toggleInstrumentMask(mask: boolean[], members: number[], allIncluded: boolean[]): boolean[] {
  const selected = new Set(members);
  const enabled = !members.every((index) => mask[index]);
  const next = mask.map((value, index) => selected.has(index) ? enabled : value);
  return next.some(Boolean) ? next : [...allIncluded];
}

export function soloInstrumentMask(mask: boolean[], members: number[], allIncluded: boolean[]): boolean[] {
  const selected = new Set(members);
  const alreadySolo = mask.some(Boolean) && mask.every((enabled,index) => !enabled || selected.has(index));
  return alreadySolo ? [...allIncluded] : mask.map((_,index) => selected.has(index));
}
