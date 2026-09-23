type Entry = {
  start: number;
  end: number;
  update: (playing: boolean) => void;
};

// Notes are indexed by the seconds they overlap, not just their onset: seeking
// into a held note must find it too. Very long notes use wider buckets so each
// registration takes bounded space (at most 65 buckets), even for hour-long MIDI.
export function createNotePlaybackIndex() {
  const levels = new Map<number, Map<number, Set<Entry>>>();
  const active = new Set<Entry>();
  let position: number | null = null;

  function setPlaying(entry: Entry, playing: boolean) {
    if (active.has(entry) === playing) return;
    if (playing) active.add(entry);
    else active.delete(entry);
    entry.update(playing);
  }

  return {
    register(start: number, end: number, update: Entry['update']) {
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        update(false);
        return () => {};
      }
      const entry = { start, end, update };
      let width = 1;
      while ((end - start) / width > 64) width *= 64;
      let buckets = levels.get(width);
      if (!buckets) levels.set(width, (buckets = new Map()));
      const first = Math.floor(start / width);
      const last = Math.ceil(end / width) - 1;
      for (let second = first; second <= last; second++) {
        let bucket = buckets.get(second);
        if (!bucket) buckets.set(second, (bucket = new Set()));
        bucket.add(entry);
      }
      const playing = position !== null && start <= position && position < end;
      if (playing) active.add(entry);
      update(playing);
      return () => {
        active.delete(entry);
        for (let second = first; second <= last; second++) {
          const bucket = buckets!.get(second)!;
          bucket.delete(entry);
          if (!bucket.size) buckets!.delete(second);
        }
        if (!buckets!.size) levels.delete(width);
      };
    },
    reset() {
      active.forEach((entry) => setPlaying(entry, false));
      position = null;
    },
    advance(time: number) {
      if (!Number.isFinite(time) || time === position) return;
      // Only previously lit notes need clearing. No all-note scan on seeks.
      active.forEach((entry) => {
        if (time < entry.start || time >= entry.end) setPlaying(entry, false);
      });
      levels.forEach((buckets, width) => {
        buckets.get(Math.floor(time / width))?.forEach((entry) => {
          if (entry.start <= time && time < entry.end) setPlaying(entry, true);
        });
      });
      position = time;
    },
  };
}

// Half-open measures: the new measure becomes active exactly at its start.
export function findPlaybackMeasure(measures: number[], time: number): number | null {
  if (!Number.isFinite(time) || !measures.length || time < measures[0]) return null;
  let low = 0;
  let high = measures.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (measures[middle] <= time) low = middle + 1;
    else high = middle;
  }
  return low; // One-based, matching MeasureNumbers/AnalysisGrid.
}

// First find active sections; only then enter their note dictionaries. A long
// note rendered in several sections never makes the other sections light up.
export function createSectionPlaybackClock() {
  const sectionIndex = createNotePlaybackIndex();
  const unscoped = createNotePlaybackIndex();
  type Group = { index: ReturnType<typeof createNotePlaybackIndex>; count: number; remove: () => void };
  const groups = new Map<string, Group>();
  const activeGroups = new Set<Group>();
  let position: number | null = null;
  return {
    register(start: number, end: number, update: Entry['update'], section?: readonly [number, number] | null) {
      if (!section) return unscoped.register(start, end, update);
      const key = `${section[0]}:${section[1]}`;
      let group = groups.get(key);
      if (!group) {
        const created: Group = { index: createNotePlaybackIndex(), count: 0, remove: () => {} };
        group = created;
        groups.set(key, created);
        created.remove = sectionIndex.register(section[0], section[1], (playing) => {
          if (playing) activeGroups.add(created);
          else {
            activeGroups.delete(created);
            created.index.reset();
          }
        });
        if (position !== null && activeGroups.has(created)) created.index.advance(position);
      }
      group.count++;
      const unregister = group.index.register(Math.max(start, section[0]), Math.min(end, section[1]), update);
      return () => {
        unregister();
        if (--group!.count === 0) {
          group!.remove();
          activeGroups.delete(group!);
          groups.delete(key);
        }
      };
    },
    reset() {
      sectionIndex.reset();
      unscoped.reset();
      position = null;
    },
    advance(time: number) {
      if (!Number.isFinite(time)) return;
      position = time;
      sectionIndex.advance(time);
      activeGroups.forEach((group) => group.index.advance(time));
      unscoped.advance(time);
    },
  };
}
