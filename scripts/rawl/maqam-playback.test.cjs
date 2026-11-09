const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const {
  MAQAM_SCALES,
} = require("../../src/components/rawl/legends/maqamScales");
const {
  maqamPitches,
  maqamLowerPitches,
  maqamRootJins,
  maqamPlaybackSection,
  maqamNoteSpan,
  maqamPracticeBlocks,
  maqamPracticeEvents,
  registerMaqamNoteEvents,
  MAQAM_PRACTICE_NOTE_SECONDS,
  MAQAM_PRACTICE_PAUSE_SECONDS,
} = require("../../src/components/rawl/legends/maqamPlayback");
const {
  createSectionPlaybackClock,
} = require("../../src/components/rawl/playbackIndex");

test("legend root ajnas include stable fifths and keep their practical lower notes", () => {
  const cores = {
    Ajam: [0, 2, 4, 5, 7], Rast: [0, 2, 3.5, 5, 7],
    Hijaz: [0, 1, 4, 5, 7], Kurd: [0, 1, 3, 5, 7],
    Nahawand: [0, 2, 3, 5, 7], Nikriz: [0, 2, 3, 6, 7], Bayati: [0, 1.5, 3, 5, 7],
    Saba: [0, 1.5, 3, 4, 7], Huzzam: [0, 1.5, 3.5],
  };
  for (const maqam of MAQAM_SCALES) {
    const jins = maqamRootJins(maqam, true);
    assert.deepEqual(jins.pitches, [...maqamLowerPitches(maqam), ...cores[maqam.name]]);
    assert.equal(jins.name, maqam.name === "Huzzam" ? "sikah" : maqam.name.toLowerCase());
    assert.ok(!jins.name.includes("‘"));
    const events = maqamPracticeEvents(maqam, true);
    assert.ok(events.length > 0);
    events.forEach((event) => {
      assert.ok(event.index >= 0 && event.index < jins.pitches.length);
      assert.equal(event.midi, 60 + maqam.tonic + jins.pitches[event.index]);
    });
  }
});

test("Rawl playback selects one merged-scale occurrence on one stave, including repeated pitches", () => {
  const clock = createSectionPlaybackClock();
  const active = new Set();
  for (const maqam of MAQAM_SCALES) {
    const pitches = maqamPitches(maqam);
    assert.deepEqual(pitches, [...maqamLowerPitches(maqam), ...maqam.scale]);
    const section = maqamPlaybackSection(maqam);
    pitches.forEach((_, index) => {
      const key = `${maqam.name}-${index}`;
      clock.register(
        ...maqamNoteSpan(section, index),
        (playing) => (playing ? active.add(key) : active.delete(key)),
        section,
      );
    });
  }
  for (const maqam of MAQAM_SCALES) {
    maqamPitches(maqam).forEach((_, index) => {
      const [start] = maqamNoteSpan(maqamPlaybackSection(maqam), index);
      clock.advance(start + 0.2);
      assert.deepEqual([...active], [`${maqam.name}-${index}`]);
    });
  }
  // Seek directly to the second fifth in Ajam: its earlier copy stays dark.
  const ajam = MAQAM_SCALES[0];
  const lastFifth = maqamPitches(ajam).lastIndexOf(7);
  clock.advance(maqamNoteSpan(maqamPlaybackSection(ajam), lastFifth)[0] + 0.2);
  assert.deepEqual([...active], [`Ajam-${lastFifth}`]);
  clock.reset();
  assert.equal(active.size, 0);
});

test("fast legato rounds return to tonic, reach every lower note and repeat ascending alternatives", () => {
  const ajam = MAQAM_SCALES.find((m) => m.name === "Ajam");
  const pitches = maqamPitches(ajam);
  assert.deepEqual(
    maqamPracticeBlocks(ajam).map((block) =>
      block.map((index) => pitches[index]),
    ),
    [
      [0, 2, 4, 2, 0],
      [0, -1, -3, -1, 0],
      [0, -1, 0, 2, 4, 2, 0],
      [0, 2, 4, 5, 7, 5, 4, 2, 0],
      [0, 2, 4, 5, 7, 9, 11, 12, 12, 10, 9, 7, 5, 4, 2, 0],
    ],
  );
  for (const maqam of MAQAM_SCALES) {
    const notes = maqamPitches(maqam);
    const blocks = maqamPracticeBlocks(maqam);
    blocks.forEach((block) => {
      assert.equal(notes[block[0]], 0);
      assert.equal(notes[block.at(-1)], 0);
      block.forEach((index) => assert.ok(index >= 0 && index < notes.length));
    });
    const events = maqamPracticeEvents(maqam);
    for (let block = 0; block + 1 < blocks.length; block++) {
      const last = events.filter((event) => event.block === block).at(-1);
      const next = events.find((event) => event.block === block + 1);
      assert.ok(
        next.start - last.start - last.duration >=
          MAQAM_PRACTICE_PAUSE_SECONDS - 1e-9,
      );
    }
    events.forEach((event, index) => {
      assert.equal(event.duration, MAQAM_PRACTICE_NOTE_SECONDS);
      const next = events[index + 1];
      if (next && next.block === event.block) {
        assert.ok(
          Math.abs(event.start + event.duration - next.start) < 1e-9,
          "neighbouring notes meet exactly in legato",
        );
      }
    });
    assert.ok(MAQAM_PRACTICE_NOTE_SECONDS < 0.3);
  }
  const blockPitches = (name) => {
    const maqam = MAQAM_SCALES.find((m) => m.name === name);
    const notes = maqamPitches(maqam);
    return maqamPracticeBlocks(maqam).map((block) =>
      block.map((index) => notes[index]),
    );
  };
  assert.deepEqual(blockPitches("Kurd")[1], [0, -2, 0]);
  assert.deepEqual(blockPitches("Saba")[0], [0, 1.5, 3, 4, 3, 1.5, 0]);
  assert.deepEqual(blockPitches("Saba")[2], [0, -2, 0, 1.5, 3, 4, 3, 1.5, 0]);
  assert.deepEqual(blockPitches("Saba")[3], [0, 1.5, 3, 4, 7, 4, 3, 1.5, 0]);
  assert.deepEqual(
    blockPitches("Saba")[1],
    [0, -2, -3.5, -2, 0, 1.5, 3, 4, 3, 1.5, 0],
  );
  assert.deepEqual(blockPitches("Huzzam")[1], [0, -1.5, -3.5, -1.5, 0]);
  assert.deepEqual(blockPitches("Nahawand")[1], [0, -1, -3, -4, -3, -1, 0]);
  assert.deepEqual(
    blockPitches("Hijaz")[4].slice(8),
    [12, 10, 8, 7, 5, 4, 1, 0],
  );
  assert.deepEqual(
    blockPitches("Hijaz")[5],
    [0, 1, 4, 5, 7, 8.5, 10, 12, 12, 10, 8.5, 7, 5, 4, 1, 0],
  );
  assert.deepEqual(blockPitches("Hijaz")[6],
    [0, 1, 4, 5, 7, 8, 11, 12, 13, 16, 16, 13, 12, 11, 8, 7, 5, 4, 1, 0]);
  assert.deepEqual(
    blockPitches("Huzzam")[4].slice(8),
    [12, 10.5, 8.5, 7.5, 4.5, 3.5, 1.5, 0],
  );
  assert.deepEqual(
    blockPitches("Huzzam")[5],
    [0, 1.5, 3.5, 5.5, 7, 8.5, 10.5, 12, 12, 10.5, 8.5, 7, 5.5, 3.5, 1.5, 0],
  );
  assert.deepEqual(
    blockPitches("Rast")[4].slice(8),
    [12, 10, 9, 7, 5, 3.5, 2, 0],
  );
});

test("Rawl event subscriptions highlight one repeated occurrence and stay dark during block pauses", () => {
  for (const maqam of MAQAM_SCALES) {
    const clock = createSectionPlaybackClock();
    const section = maqamPlaybackSection(maqam);
    const events = maqamPracticeEvents(maqam);
    const active = new Set();
    maqamPitches(maqam).forEach((_, index) =>
      registerMaqamNoteEvents(clock, events, index, section, (playing) =>
        playing ? active.add(index) : active.delete(index),
      ),
    );
    events.forEach((event, index) => {
      clock.advance(section[0] + event.start + 0.05);
      assert.deepEqual([...active], [event.index]);
      const time = event.start + event.duration + 0.005;
      clock.advance(section[0] + time);
      const next = events[index + 1];
      assert.deepEqual(
        [...active],
        next && next.start <= time ? [next.index] : [],
      );
    });
    clock.advance(section[0] + 0.05);
    const changes = [];
    const remove = registerMaqamNoteEvents(
      clock,
      events,
      maqamLowerPitches(maqam).length,
      section,
      (playing) => changes.push(playing),
    );
    assert.equal(
      changes.at(-1),
      true,
      "future repeats must not clear the currently playing tonic when notes remount",
    );
    remove();
    clock.reset();
    assert.equal(active.size, 0);
  }
});

test("Saba adds a full-range final ascent and descent, including every upper extension", () => {
  const saba = MAQAM_SCALES.find((maqam) => maqam.name === "Saba");
  const pitches = maqamPitches(saba);
  const blocks = maqamPracticeBlocks(saba);
  assert.equal(blocks.length, 6);
  assert.deepEqual(blocks[5].map((index) => pitches[index]),
    [...saba.scale, ...saba.scale.slice(0, -1).reverse()]);
  const events = maqamPracticeEvents(saba).filter(event => event.block === 5);
  assert.equal(events.filter(event => event.midi === 60 + saba.tonic + saba.scale.at(-1)).length, 1);
  assert.ok(events.every((event, index) => index === 0 || event.midi !== events[index - 1].midi));
  for (const rootOnly of [false, true]) {
    const rounds = maqamPracticeBlocks(saba, rootOnly);
    for (const index of [2, 3]) assert.ok(rounds[index].some(i => pitches[i] === 4));
  }
  assert.equal(maqamPracticeBlocks(saba, true).length, 4);
});

test("named family shoulders use their source intervals and practice the full branch", () => {
  const bayati = MAQAM_SCALES.find(m => m.name === "Bayati");
  const shuri = bayati.namedShoulders.find(s => s.name === "Bayati Shuri");
  assert.deepEqual(bayati.scale.slice(shuri.start, shuri.end + 1), [5, 6, 9, 10, 12]);
  const pitches = maqamPitches(bayati);
  assert.deepEqual(maqamPracticeBlocks(bayati)[6].map(i => pitches[i]),
    [0, 1.5, 3, 5, 6, 9, 10, 12, 12, 10, 9, 6, 5, 3, 1.5, 0]);
  const hijaz = MAQAM_SCALES.find(m => m.name === "Hijaz");
  const hijazkar = hijaz.namedShoulders.find(s => s.name === "Hijazkar");
  assert.deepEqual(hijaz.scale.slice(hijazkar.start, hijazkar.end + 1), [5, 7, 8, 11, 12, 13, 16]);
  assert.equal(bayati.alternateSource.figure, "24.17");
  assert.equal(hijaz.alternateSource.figure, "24.35");
});

test("legend ajnas finish after four practice rounds without repeating the full core", () => {
  for (const maqam of MAQAM_SCALES) {
    const blocks = maqamPracticeBlocks(maqam, true);
    assert.equal(blocks.length, 4, maqam.name);
    const events = maqamPracticeEvents(maqam, true);
    assert.equal(events.at(-1).block, 3);
    assert.equal(events.at(-1).midi, 60 + maqam.tonic);
    assert.ok(maqamPracticeBlocks(maqam).length >= 5);
  }
});

test("Kurd, Hijaz and Bayati legend rounds reach their stable fifth without changing source brackets", () => {
  for (const name of ["Kurd", "Hijaz", "Bayati"]) {
    const maqam = MAQAM_SCALES.find((m) => m.name === name);
    assert.equal(maqamRootJins(maqam).end, 3);
    const jins = maqamRootJins(maqam, true);
    assert.equal(jins.pitches.at(-1), 7);
    const finalRound = maqamPracticeBlocks(maqam, true).at(-1);
    assert.equal(Math.max(...finalRound.map((index) => jins.pitches[index])), 7);
    assert.equal(maqamPracticeEvents(maqam, true).filter((event) => event.block === 3)
      .some((event) => event.midi === 60 + maqam.tonic + 7), true);
  }
});
