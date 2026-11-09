import { createMidiNumberToY } from "../noteCoordinates";
import {
  QUARTER_TONE_MARKER_OFFSET,
  QUARTER_TONE_MARKER_SIZE,
} from "../pitchBend";

export type MaqamNotationGroup = {
  label: string;
  start: number;
  end: number;
  above?: boolean;
};

export const MAQAM_ROW_GAP = 8;
const BRACKET_GAP = 4;
const BRACKET_HEIGHT = 4;
const LABEL_HEIGHT = 10;
const LABEL_GAP = 2;
const EDGE_PADDING = 2;
const CONTROL_HEIGHT = 45;

export const getMaqamNotationLayout = (
  pitches: number[],
  groups: MaqamNotationGroup[],
  noteHeight: number,
) => {
  const range: [number, number] = [
    Math.min(0, ...pitches),
    Math.max(0, ...pitches),
  ];
  const pitchHeight = (range[1] - range[0] + 1) * noteHeight;
  const pitchToY = createMidiNumberToY(pitchHeight, range, noteHeight);
  const placed: { group: MaqamNotationGroup; top: number; bottom: number }[] =
    [];
  const groupTops = groups.map((group) => {
    const notes = pitches.slice(group.start, group.end + 1);
    if (group.above) {
      // Root-jins brackets follow the normal note-top contour.
      return (
        pitchToY(Math.max(...notes)) - noteHeight - BRACKET_GAP - BRACKET_HEIGHT
      );
    }
    let top = pitchToY(Math.min(...notes)) + noteHeight + BRACKET_GAP;
    const annotationHeight = BRACKET_HEIGHT + LABEL_GAP + LABEL_HEIGHT;
    for (const previous of placed) {
      // A common endpoint is allowed, just as in the source's jins brackets.
      if (
        group.start < previous.group.end &&
        group.end > previous.group.start &&
        top < previous.bottom + LABEL_GAP &&
        top + annotationHeight > previous.top
      ) {
        top = previous.bottom + LABEL_GAP;
      }
    }
    placed.push({ group, top, bottom: top + annotationHeight });
    return top;
  });
  const top = Math.min(
    -3 * noteHeight,
    ...groups.map(
      (group, index) =>
        groupTops[index] - (group.above ? LABEL_HEIGHT + LABEL_GAP : 0),
    ),
  );
  const bottom = Math.max(
    pitchHeight + QUARTER_TONE_MARKER_OFFSET + QUARTER_TONE_MARKER_SIZE / 2,
    ...groups.map(
      (group, index) =>
        groupTops[index] +
        BRACKET_HEIGHT +
        (group.above ? 0 : LABEL_GAP + LABEL_HEIGHT),
    ),
  );
  const topPadding = EDGE_PADDING - top;
  return {
    topPadding,
    tonicLineY: pitchToY(0) + noteHeight + topPadding,
    fifthLineY: pitchToY(7) + noteHeight + topPadding,
    height: Math.max(CONTROL_HEIGHT, bottom - top + 2 * EDGE_PADDING),
    groupTops: groupTops.map((position) => position + topPadding),
  };
};

export const splitMaqamColumns = <T>(rows: T[], columnCount = 1): T[][] => {
  if (columnCount === 1) return [rows];
  const split = Math.floor(rows.length / 2);
  return [rows.slice(0, split), rows.slice(split)];
};

export const fitMaqamNoteHeight = (
  rows: { pitches: number[]; groups: MaqamNotationGroup[] }[],
  availableHeight: number,
  columnCount = 1,
) => {
  if (!availableHeight) return 3;
  const columns = splitMaqamColumns(rows, columnCount);
  let low = 0;
  let high = availableHeight;
  for (let iteration = 0; iteration < 32; iteration++) {
    const middle = (low + high) / 2;
    const height = Math.max(
      ...columns.map((column) =>
        column.reduce(
          (sum, row) =>
            sum +
            getMaqamNotationLayout(row.pitches, row.groups, middle).height,
          (column.length - 1) * MAQAM_ROW_GAP,
        ),
      ),
    );
    if (height <= availableHeight) low = middle;
    else high = middle;
  }
  return low;
};
