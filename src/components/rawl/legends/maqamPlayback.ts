import { QANUN_NOTE_SECONDS, QanunScheduledNote } from "../../../sampler/qanun";
import { MAQAM_SCALES, MaqamScale } from "./maqamScales";
import type { createSectionPlaybackClock } from "../playbackIndex";

export const maqamLowerPitches = (maqam: MaqamScale) =>
  maqam.practicalLower ?? maqam.lower;

export const maqamPitches = (maqam: MaqamScale) => [
  ...maqamLowerPitches(maqam),
  ...maqam.scale,
];

export const maqamRootJins = (maqam: MaqamScale, includeStableFifth = false) => {
  const group = maqam.scaleGroups.find((group) => group.start === 0)!;
  // Match the root bracket on /maqam, including its approved core extension.
  const end = Math.max(group.end, Math.min(5, maqam.coreLength) - 1,
    includeStableFifth && ["Kurd", "Hijaz", "Bayati"].includes(maqam.name) ? 4 : 0);
  return {
    name: group.label.replace(/ 1$/, "").toLowerCase(),
    end,
    pitches: [...maqamLowerPitches(maqam), ...maqam.scale.slice(0, end + 1)],
  };
};

// Distinct timeline sections let Rawl's existing clock select one stave.
export const maqamPlaybackSection = (maqam: MaqamScale): [number, number] => {
  const start = MAQAM_SCALES.findIndex(({ name }) => name === maqam.name) * 60;
  return [start, start + 60];
};

export const maqamNoteSpan = (
  section: readonly [number, number],
  index: number,
): [number, number] => [
  section[0] + index * QANUN_NOTE_SECONDS,
  section[0] + (index + 1) * QANUN_NOTE_SECONDS,
];

export type MaqamPlaybackEvent = QanunScheduledNote & {
  index: number;
  block?: number;
};
export const MAQAM_PRACTICE_NOTE_SECONDS = 0.22;
export const MAQAM_PRACTICE_PAUSE_SECONDS = 0.8;

export const maqamPracticeBlocks = (maqam: MaqamScale, rootOnly = false): number[][] => {
  const pitches = maqamPitches(maqam);
  const lower = maqamLowerPitches(maqam);
  const tonic = lower.length;
  const ascending = maqam.scale.slice(0, rootOnly ? maqamRootJins(maqam, true).end + 1 : 8)
    .map((_, index) => tonic + index);
  const lower7 = lower.indexOf(maqam.scale[6] - 12);
  const returnToTonic = (outward: number[]) => [
    ...outward,
    ...outward.slice(0, -1).reverse(),
  ];
  const below = [tonic, ...lower.map((_, index) => index).reverse()];
  const variants = rootOnly ? [] : (maqam.practiceVariants ?? [])
    .map(({ start, end }) => maqam.scale.slice(start, end + 1)
      .map((_, index) => tonic + start + index));
  // Keep the original descending shoulder separate from added ascending branches.
  const tailEnd = maqam.practiceVariants?.[0]?.start ?? maqam.scale.length;
  const tail = rootOnly ? [] : maqam.scale.slice(8, tailEnd)
    .map((_, index) => tonic + 8 + index);
  const ascendingAlternative =
    tail.length > 1 &&
    pitches[tail[0]] < pitches[tail[tail.length - 1]] &&
    pitches[tail[tail.length - 1]] === pitches[ascending[7]];
  const shoulder = tail
    .filter((index) => pitches[index] <= pitches[ascending[7]])
    .sort((a, b) => pitches[b] - pitches[a]);
  let descending = [...ascending].reverse();
  if (shoulder.length && !ascendingAlternative) {
    descending = [
      ...(pitches[shoulder[0]] === pitches[ascending[7]] ? [] : [ascending[7]]),
      ...shoulder,
      ...ascending
        .filter(
          (index) => pitches[index] < pitches[shoulder[shoulder.length - 1]],
        )
        .reverse(),
    ];
  }
  const blocks = [
    returnToTonic(ascending.slice(0, maqam.name === "Saba" ? 4 : 3)),
    returnToTonic(below),
    [
      tonic,
      ...(lower7 < 0 ? [] : [lower7]),
      ...returnToTonic(ascending.slice(0, maqam.name === "Saba" ? 4 : 3)),
    ],
    returnToTonic(ascending.slice(0, 5)),
  ];
  if (!rootOnly) blocks.push([...ascending, ...descending]);
  if (maqam.name === "Saba") {
    blocks[1].push(...returnToTonic(ascending.slice(0, 4)).slice(1));
  }
  for (const branch of variants.length ? variants : ascendingAlternative ? [tail] : []) {
    const alternative = [
      ...ascending.filter((index) => pitches[index] < pitches[branch[0]]),
      ...branch,
    ];
    blocks.push([...alternative, ...alternative.slice().reverse()]);
  }
  if (maqam.name === "Saba" && !rootOnly) {
    const complete = maqam.scale.map((_, index) => tonic + index);
    blocks.push(returnToTonic(complete));
  }
  return blocks;
};

export const maqamPracticeEvents = (
  maqam: MaqamScale,
  rootOnly = false,
): MaqamPlaybackEvent[] => {
  const pitches = maqamPitches(maqam);
  let time = 0;
  return maqamPracticeBlocks(maqam, rootOnly).flatMap((indices, block) => {
    const events = indices.map((index) => {
      const event = {
        index,
        block,
        midi: 60 + maqam.tonic + pitches[index],
        start: time,
        duration: MAQAM_PRACTICE_NOTE_SECONDS,
      };
      time += MAQAM_PRACTICE_NOTE_SECONDS;
      return event;
    });
    time += MAQAM_PRACTICE_PAUSE_SECONDS;
    return events;
  });
};

// A single drawing can sound several times in a practice sequence. Aggregate
// its interval subscriptions so a future inactive repeat cannot clear it.
export const registerMaqamNoteEvents = (
  clock: ReturnType<typeof createSectionPlaybackClock>,
  events: MaqamPlaybackEvent[],
  index: number,
  section: readonly [number, number],
  update: (playing: boolean) => void,
) => {
  const active = new Set<number>();
  const matching = events.filter((event) => event.index === index);
  update(false);
  const remove = matching.map((event, occurrence) =>
    clock.register(
      section[0] + event.start,
      section[0] + event.start + event.duration,
      (playing) => {
        if (playing) active.add(occurrence);
        else active.delete(occurrence);
        update(active.size > 0);
      },
      section,
    ),
  );
  return () => remove.forEach((unregister) => unregister());
};
