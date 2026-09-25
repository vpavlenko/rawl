import * as React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DUMMY_CALLBACK, VoiceMask } from "../App";
import { Analysis, getPhraseStarts, MeasuresSpan } from "./analysis";
import { getSectionOffsets } from "./sectionAnchors";
import { AnalysisGrid, MeasureSelection } from "./AnalysisGrid";
import { getNoteRectangles, MouseHandlers } from "./getNoteRectangles";
import ControlPanel, { debounce } from "./layouts/ControlPanel";
import { MeasureNumbers } from "./layouts/MeasureNumbers";
import MergedVoicesLegend from "./layouts/MergedVoicesLegend";
import { VoiceName } from "./layouts/VoiceName";
import { ColoredNote, ColoredNotesInVoices, Note } from "./parseMidi";
import { SecondsConverter, SecondsSpan, SetVoiceMask } from "./Rawl";
import { PlaybackSectionContext } from "./notePlayback";
import { getSortedVoices, VoiceZIndicesContext } from "./voiceOrder";

export type MeasuresAndBeats = {
  measures: number[];
  beats: number[];
  ticks?: { measures: number[] };
};

const getAverageMidiNumber = (notes: Note[]) =>
  notes.length > 0
    ? notes[0].isDrum
      ? 0
      : notes.reduce((sum, note) => sum + note.note.midiNumber, 0) /
        notes.length
    : Infinity;

export type MidiRange = [number, number];

// Pack each track's drum rows using only sounds present in the section.
type DrumRows = Map<number, Map<number, number>>;

const getDrumRows = (notes: Note[]): DrumRows => {
  const sounds = new Map<number, Set<number>>();
  notes.forEach((note) => {
    if (!note.isDrum) return;
    if (!sounds.has(note.voiceIndex)) sounds.set(note.voiceIndex, new Set());
    sounds.get(note.voiceIndex)!.add(note.note.midiNumber);
  });
  let row = 0;
  const drumRows: DrumRows = new Map();
  [...sounds.entries()]
    .sort(([a], [b]) => a - b)
    .forEach(([voiceIndex, midiNumbers]) => {
      const rows = new Map<number, number>();
      [...midiNumbers].sort((a, b) => b - a).forEach((number) => {
        rows.set(number, row++);
      });
      drumRows.set(voiceIndex, rows);
    });
  return drumRows;
};

const getMidiRange = (notes: Note[], span?: SecondsSpan): MidiRange => {
  let min = +Infinity;
  let max = -Infinity;
  for (const note of notes) {
    if (span && (note.span[1] < span[0] || note.span[0] > span[1])) {
      continue;
    }
    const { midiNumber, relativeNumber } = note.note;
    const number = relativeNumber === undefined ? midiNumber : relativeNumber;
    min = Math.min(min, number);
    max = Math.max(max, number);
  }
  return [min, max];
};

export type ScrollInfo = {
  left: number;
  right: number;
};

export const Voice: React.FC<{
  notes: ColoredNote[];
  measuresAndBeats: MeasuresAndBeats;
  analysis: Analysis;
  phraseStarts: number[];
  mouseHandlers: MouseHandlers;
  measureSelection: MeasureSelection;
  scrollInfo: ScrollInfo;
  voiceName: string;
  setVoiceMask: SetVoiceMask;
  voiceIndex: number;
  voiceMask: VoiceMask;
  showTonalGrid?: boolean;
  noteHeight: number;
  secondsToX: SecondsConverter;
  xToSeconds: SecondsConverter;
  sectionSpan?: MeasuresSpan;
  enableManualRemeasuring: boolean;
  hoveredColors: string[] | null;
  hoveredVoiceIndex?: number | null;
  playbackMeasure: number | null;
  showPlaybackMeasureBottomBorder: boolean;
}> = React.memo(({
  notes,
  measuresAndBeats,
  analysis,
  mouseHandlers,
  measureSelection,
  phraseStarts,
  scrollInfo,
  voiceName,
  voiceIndex = -1,
  setVoiceMask = (mask) => {},
  voiceMask,
  showTonalGrid = true,
  noteHeight,
  secondsToX,
  xToSeconds,
  sectionSpan,
  enableManualRemeasuring,
  hoveredColors,
  hoveredVoiceIndex = null,
  playbackMeasure,
  showPlaybackMeasureBottomBorder,
}) => {
  // To restore it, we need to lock the calculation of frozenRange and frozenHeight
  // and don't change it after loading the notes.

  const localMidiRange = useMemo(
    () =>
      getMidiRange(notes, [
        xToSeconds(scrollInfo.left),
        xToSeconds(scrollInfo.right),
      ]),
    [notes, scrollInfo, xToSeconds],
  );
  const pitchedNotes = useMemo(
    () => notes.filter((note) => !note.isDrum),
    [notes],
  );
  const drumRows = useMemo(() => getDrumRows(notes), [notes]);
  const midiRange = useMemo<MidiRange>(
    () => (pitchedNotes.length ? getMidiRange(pitchedNotes) : [0, 0]),
    [pitchedNotes],
  );

  const { systemClickHandler, handleNoteClick, handleMouseEnter } =
    mouseHandlers;
  const emptySpaceCursor =
    !enableManualRemeasuring && systemClickHandler ? "text" : "default";

  const pitchedHeight =
    (pitchedNotes.length ? midiRange[1] - midiRange[0] + 1 : 0) *
    noteHeight;
  const drumRowCount = [...drumRows.values()].reduce(
    (sum, rows) => sum + rows.size,
    0,
  );
  const drumTop = pitchedHeight + (pitchedNotes.length ? noteHeight * 2 : 0);
  const drumRowHeight = noteHeight * 3;
  const height = drumRowCount
    ? drumTop + drumRowCount * drumRowHeight
    : pitchedHeight;

  const midiNumberToY = useCallback(
    (midiNumber) => pitchedHeight - (midiNumber - midiRange[0] + 1) * noteHeight,
    [pitchedHeight, midiRange, noteHeight],
  );
  const drumNoteToY = useCallback(
    (note: Note) =>
      drumTop +
      (drumRows.get(note.voiceIndex)!.get(note.note.midiNumber)! + 0.5) *
        drumRowHeight,
    [drumTop, drumRows, drumRowHeight],
  );

  // The frozenHeight machinery was used when I experimented with smart
  // collapse/expand of every Voice relative to its current range on a current screen.
  // I'm not sure it's used anymore.
  const sectionEndX = sectionSpan
    ? secondsToX(measuresAndBeats.measures[sectionSpan[1]])
    : undefined;
  const { noteRectangles, frozenHeight, frozenMidiRange } = useMemo(
    () => ({
      noteRectangles: getNoteRectangles(
        notes,
        midiNumberToY,
        noteHeight,
        handleNoteClick,
        handleMouseEnter,
        DUMMY_CALLBACK,
        secondsToX,
        enableManualRemeasuring,
        hoveredColors,
        false,
        drumNoteToY,
        hoveredVoiceIndex,
        sectionEndX,
      ),
      frozenHeight: height,
      frozenMidiRange: midiRange,
    }),
    [
      notes,
      analysis,
      handleNoteClick,
      handleMouseEnter,
      voiceMask,
      noteHeight,
      secondsToX,
      enableManualRemeasuring,
      hoveredColors,
      hoveredVoiceIndex,
      midiNumberToY,
      drumNoteToY,
      height,
      midiRange,
      sectionEndX,
    ],
  );

  const { measures } = measuresAndBeats;
  const playbackSection = useMemo<readonly [number, number] | null>(
    () => sectionSpan ? [measures[sectionSpan[0]], measures[sectionSpan[1]]] : null,
    [measures, sectionSpan],
  );
  // TODO: make smarter once Stacked is implemented
  const hasVisibleNotes =
    voiceMask[voiceIndex] &&
    (!!sectionSpan || localMidiRange[1] >= localMidiRange[0]);

  return (
    <div
      key={`voice_${voiceIndex}_${measuresAndBeats.measures.at(-1)}_parent`}
      style={{
        width: secondsToX(measures[sectionSpan?.[1] ?? measures.length - 1]),
        flexShrink: 0,
        height: hasVisibleNotes ? height : 1,
        position: "relative",
        marginTop: hasVisibleNotes ? "15px" : 0,
        marginBottom: hasVisibleNotes ? "0px" : 0,
        marginLeft: "0px",
        // borderBottom: hasVisibleNotes ? "1px solid #888" : "",
        zIndex: 10,
        backgroundColor: "black",
        cursor: emptySpaceCursor,
      }}
      onClick={(e) => systemClickHandler(e, xToSeconds)}
    >
      <div
        style={{
          position: "relative",
          top:
            height -
            frozenHeight +
            (midiRange[0] - frozenMidiRange[0]) * noteHeight,
        }}
      >
        <PlaybackSectionContext.Provider value={playbackSection}>
          {voiceMask[voiceIndex] ? noteRectangles : null}
        </PlaybackSectionContext.Provider>
      </div>
      {hasVisibleNotes ? (
        <AnalysisGrid
          analysis={analysis}
          measuresAndBeats={measuresAndBeats}
          midiNumberToY={midiNumberToY}
          noteHeight={noteHeight}
          measureSelection={measureSelection}
          phraseStarts={phraseStarts}
          midiRange={midiRange}
          showHeader={false}
          showTonalGrid={showTonalGrid && pitchedNotes.length > 0}
          secondsToX={secondsToX}
          sectionSpan={sectionSpan}
          playbackMeasure={playbackMeasure}
          showPlaybackMeasureBottomBorder={showPlaybackMeasureBottomBorder}
        />
      ) : null}
      {hasVisibleNotes &&
      voiceMask.length > 1 &&
      (sectionSpan?.[0] ?? 0) === 0 &&
      voiceName ? (
        <VoiceName
          voiceName={voiceName}
          voiceMask={voiceMask}
          setVoiceMask={setVoiceMask}
          voiceIndex={voiceIndex}
          scrollInfo={scrollInfo}
          secondsToX={secondsToX}
          midiNumberToY={midiNumberToY}
        />
      ) : null}
    </div>
  );
});

type Section = {
  sectionSpan: MeasuresSpan;
  secondsToX: SecondsConverter;
  xToSeconds: SecondsConverter;
  voices: { voiceIndex: number; notes: ColoredNote[] }[];
};

export type SystemLayoutProps = {
  drumVoices?: number[];
  nativeDrumVoices?: number[];
  onToggleVoiceDrum?: (voiceIndex: number) => void;
  excludedVoices?: number[];
  onToggleVoiceExcluded?: (voiceIndex: number) => void;
  notes: ColoredNotesInVoices;
  voiceNames: string[];
  voiceMask: VoiceMask;
  measuresAndBeats: MeasuresAndBeats;
  playbackMeasure: number | null;
  analysis: Analysis;
  mouseHandlers: MouseHandlers;
  measureSelection: MeasureSelection;
  setVoiceMask: SetVoiceMask;
  frozenNotes: ColoredNote[][];
  enableManualRemeasuring?: boolean;
  measureStart?: number;
  slug?: string;
  currentTonic: number;
  togglePause?: () => void;
  seek?: (ms: number) => void;
  hoveredColors: string[] | null;
  setHoveredColors: (colors: string[] | null) => void;
  hoveredVoiceIndex?: number | null;
  usePageScroll?: boolean;
  onVoiceHover?: (voiceIndex: number | null) => void;
  onForcedPanningChange?: (enabled: boolean) => void;
};

export const StackedSystemLayout: React.FC<
  SystemLayoutProps & { measureStart?: number; isEmbedded?: boolean }
> = ({
  notes,
  voiceNames,
  voiceMask,
  measuresAndBeats,
  playbackMeasure,
  analysis,
  mouseHandlers,
  measureSelection,
  setVoiceMask,
  enableManualRemeasuring = false,
  measureStart,
  isEmbedded = false,
  slug,
  currentTonic,
  togglePause,
  seek,
  hoveredColors,
  setHoveredColors,
  hoveredVoiceIndex = null,
  usePageScroll = false,
}) => {
  const [noteHeight, setNoteHeight] = useState<number>(3);
  const [secondWidth, setSecondWidth] = useState<number>(40);

  const voicesSortedByAverageMidiNumber = useMemo(
    () =>
      notes
        .map((voice, voiceIndex) => ({
          average: getAverageMidiNumber(voice),
          voiceIndex,
        }))
        .sort((a, b) => b.average - a.average)
        .map(({ voiceIndex }) => ({
          voiceIndex,
          notes: notes[voiceIndex],
        })),
    [notes],
  );

  const phraseStarts = useMemo(
    () => getPhraseStarts(analysis, measuresAndBeats.measures.length),
    [analysis, measuresAndBeats],
  );

  const sectionSpans = useMemo(() => {
    return (analysis.sections ?? [0]).map((sectionStartInPhrases, index) => {
      const { measures } = measuresAndBeats;
      const start = phraseStarts[sectionStartInPhrases] - 1;
      const end =
        (index + 1 < (analysis.sections ?? [0]).length
          ? phraseStarts[(analysis.sections ?? [0])[index + 1]]
          : measures.length) - 1;
      return [start, end] as MeasuresSpan;
    });
  }, [analysis.sections, measuresAndBeats, phraseStarts]);

  const sectionOffsets = useMemo(
    () => getSectionOffsets(analysis, phraseStarts, measuresAndBeats.measures),
    [analysis, phraseStarts, measuresAndBeats],
  );

  const optimalSecondWidth = useMemo(() => {
    const viewportWidth = window.innerWidth;
    const targetWidthPercentage = 0.92;
    const targetWidth = viewportWidth * targetWidthPercentage;
    const maxMeasuresToFit = 34;

    const annotatedSections = sectionSpans.filter(
      (span) => span[1] - span[0] <= maxMeasuresToFit,
    );

    const longestSection = annotatedSections.reduce((longest, current) => {
      const currentLength =
        measuresAndBeats.measures[current[1]] -
        measuresAndBeats.measures[current[0]];
      const longestLength =
        measuresAndBeats.measures[longest[1]] -
        measuresAndBeats.measures[longest[0]];
      return currentLength > longestLength ? current : longest;
    }, annotatedSections[0]);

    if (longestSection && annotatedSections.length >= 1) {
      const longestSectionLength =
        measuresAndBeats.measures[longestSection[1]] -
        measuresAndBeats.measures[longestSection[0]];

      // Calculate optimal width for the section
      let calculatedWidth = targetWidth / longestSectionLength;

      // If the section fits within the measure limit
      // and we're in single time mode, limit to max 300px per measure
      if (longestSection[1] - longestSection[0] <= maxMeasuresToFit) {
        // Calculate how many pixels per measure with current width
        const measureCount = longestSection[1] - longestSection[0];
        const secondsPerMeasure = longestSectionLength / measureCount;
        const pixelsPerMeasure = calculatedWidth * secondsPerMeasure;

        // Limit to max 300px per measure
        if (pixelsPerMeasure > 300) {
          calculatedWidth = 300 / secondsPerMeasure;
        }
      }

      return calculatedWidth;
    }
    return secondWidth;
  }, [notes, measuresAndBeats, sectionSpans]); // Also depend on measuresAndBeats and sectionSpans

  useEffect(() => {
    setSecondWidth(optimalSecondWidth);
  }, [optimalSecondWidth]);

  const sections: Section[] = useMemo(() => {
    return sectionSpans.map((sectionSpan, index) => {
      const offset = sectionOffsets[(analysis.sections ?? [0])[index]] ?? 0;
      const secondsToX = (seconds) =>
        (seconds - measuresAndBeats.measures[sectionSpan[0]] + offset) * secondWidth;
      const xToSeconds = (x) =>
        x / secondWidth + measuresAndBeats.measures[sectionSpan[0]] - offset;
      return {
        sectionSpan,
        secondsToX,
        xToSeconds,
        voices: voicesSortedByAverageMidiNumber.map(
          ({ voiceIndex, notes }) => ({
            voiceIndex,
            notes: notes.filter(
              (note) =>
                note.span[1] >= measuresAndBeats.measures[sectionSpan[0]] &&
                note.span[0] + (note.isDrum ? -0.01 : 1e-2) <
                  measuresAndBeats.measures[sectionSpan[1]],
            ),
          }),
        ),
      };
    });
  }, [
    sectionSpans,
    sectionOffsets,
    analysis.sections,
    measuresAndBeats,
    secondWidth,
    voicesSortedByAverageMidiNumber,
  ]);

  const parentRef = useRef(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
    left: -1,
    right: 100000,
  });

  const debouncedScroll = useCallback(
    debounce(
      (left, right) =>
        setScrollInfo({
          left,
          right,
        }),
      50,
    ),
    [],
  );

  const handleScroll = () => {
    const { scrollLeft, offsetWidth } = parentRef.current;
    const scrollRight = scrollLeft + offsetWidth;

    debouncedScroll(scrollLeft, scrollRight);
  };

  useEffect(() => {
    const parentDiv = parentRef.current;
    if (parentDiv) {
      parentDiv.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (parentDiv) {
        parentDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (
      measureStart !== undefined &&
      parentRef.current &&
      sectionRefs.current.length > 0
    ) {
      const sectionIndex = sections.findIndex(
        ({ sectionSpan }) =>
          measureStart >= sectionSpan[0] && measureStart <= sectionSpan[1],
      );

      if (sectionIndex !== -1) {
        const sectionElement = sectionRefs.current[sectionIndex];
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  }, [measureStart, sections]);

  return (
    <>
      <div
        key="innerLeftPanel"
        style={{
          margin: 0,
          padding: 0,
          position: "relative",
          overflowX: "scroll",
          overflowY: usePageScroll ? "hidden" : "scroll",
          width: "100%",
          backgroundColor: "black",
        }}
        ref={parentRef}
        className="SplitLayout"
      >
        {sections.map(
          ({ sectionSpan, secondsToX, xToSeconds, voices }, order) => (
            <div
              style={{ paddingTop: 10 + noteHeight * 5 }}
              key={order}
              ref={(el) => (sectionRefs.current[order] = el)}
            >
              <MeasureNumbers
                measuresAndBeats={measuresAndBeats}
                analysis={analysis}
                phraseStarts={phraseStarts}
                measureSelection={measureSelection}
                noteHeight={noteHeight}
                secondsToX={secondsToX}
                xToSeconds={xToSeconds}
                sectionSpan={sectionSpan}
                mouseHandlers={mouseHandlers}
                togglePause={togglePause}
                seek={seek}
                playbackMeasure={
                  playbackMeasure !== null &&
                  playbackMeasure > sectionSpan[0] &&
                  playbackMeasure <= sectionSpan[1]
                    ? playbackMeasure
                    : null
                }
              />
              {voices.map(({ notes, voiceIndex }) => (
                <div
                  key={voiceIndex}
                  style={{ display: "flex", flexDirection: "row" }}
                >
                  <Voice
                    voiceName={voiceNames[voiceIndex]}
                    notes={notes}
                    measuresAndBeats={measuresAndBeats}
                    analysis={analysis}
                    mouseHandlers={mouseHandlers}
                    measureSelection={measureSelection}
                    phraseStarts={phraseStarts}
                    scrollInfo={scrollInfo}
                    voiceMask={voiceMask}
                    setVoiceMask={setVoiceMask}
                    voiceIndex={voiceIndex}
                    noteHeight={noteHeight}
                    secondsToX={secondsToX}
                    xToSeconds={xToSeconds}
                    sectionSpan={sectionSpan}
                    enableManualRemeasuring={enableManualRemeasuring}
                    hoveredColors={hoveredColors}
                    hoveredVoiceIndex={hoveredVoiceIndex}
                    playbackMeasure={
                      playbackMeasure !== null &&
                      playbackMeasure > sectionSpan[0] &&
                      playbackMeasure <= sectionSpan[1]
                        ? playbackMeasure
                        : null
                    }
                    showPlaybackMeasureBottomBorder={
                      voiceIndex ===
                      voices.reduce(
                        (lastVisibleVoiceIndex, voice) =>
                          voiceMask[voice.voiceIndex]
                            ? voice.voiceIndex
                            : lastVisibleVoiceIndex,
                        -1,
                      )
                    }
                  />
                </div>
              ))}
            </div>
          ),
        )}

        <div style={{ height: 100 }} />

        {!isEmbedded && (
          <ControlPanel
            noteHeight={noteHeight}
            setNoteHeight={setNoteHeight}
            secondWidth={secondWidth}
            setSecondWidth={setSecondWidth}
            slug={slug}
            currentTonic={currentTonic}
            setHoveredColors={setHoveredColors}
          />
        )}
      </div>
    </>
  );
};

const MERGED_VOICE_NAMES = ["merged"];
const MERGED_VOICE_MASK = [true];

export const MergedSystemLayout: React.FC<
  SystemLayoutProps & { isEmbedded?: boolean }
> = (props) => {
  const {
    notes,
    voiceNames,
    voiceMask,
    setVoiceMask,
    enableManualRemeasuring = false,
    isEmbedded = false,
    slug,
    currentTonic,
    hoveredColors,
    setHoveredColors,
  } = props;

  const [hoveredVoiceIndex, setHoveredVoiceIndex] = useState<number | null>(null);
  // Rank the full arrangement so muting, hovering, and section boundaries
  // cannot change which voice is drawn on top.
  const voiceZIndices = useMemo(() => {
    const sortedVoices = getSortedVoices(
      voiceNames,
      notes,
      props.drumVoices,
      props.nativeDrumVoices,
    );
    return new Map(
      sortedVoices.map(({ voiceIndex }, index) => [
        voiceIndex,
        // Keep every voice above the analysis grid bars (z-index 1–4).
        10 + sortedVoices.length - index,
      ]),
    );
  }, [voiceNames, notes, props.drumVoices, props.nativeDrumVoices]);
  const { onVoiceHover } = props;
  const handleVoiceHover = useCallback(
    (voiceIndex: number | null) => {
      setHoveredVoiceIndex(voiceIndex);
      onVoiceHover?.(voiceIndex);
    },
    [onVoiceHover],
  );

  useEffect(() => {
    const clearHover = () => handleVoiceHover(null);
    clearHover();
    window.addEventListener("blur", clearHover);
    return () => {
      window.removeEventListener("blur", clearHover);
      onVoiceHover?.(null);
    };
  }, [handleVoiceHover, onVoiceHover, slug, isEmbedded]);

  // Only reserve space for enabled instruments and the current hover preview.
  const flattenedNotes = useMemo(
    () => [
      notes.flatMap((voiceNotes, voiceIndex) =>
        voiceMask[voiceIndex] || voiceIndex === hoveredVoiceIndex
          ? voiceNotes
          : [],
      ),
    ],
    [notes, voiceMask, hoveredVoiceIndex],
  );

  return (
    <div style={{ position: "relative" }}>
      <VoiceZIndicesContext.Provider value={voiceZIndices}>
        <StackedSystemLayout
          {...props}
          notes={flattenedNotes}
          voiceNames={MERGED_VOICE_NAMES}
          voiceMask={MERGED_VOICE_MASK}
          enableManualRemeasuring={enableManualRemeasuring}
          isEmbedded={isEmbedded}
          slug={slug}
          hoveredColors={hoveredColors}
          setHoveredColors={setHoveredColors}
          hoveredVoiceIndex={hoveredVoiceIndex}
        />
      </VoiceZIndicesContext.Provider>
      {!isEmbedded && (
        <MergedVoicesLegend
          voiceNames={voiceNames}
          notes={notes}
          voiceMask={voiceMask}
          setVoiceMask={setVoiceMask}
          onVoiceHover={handleVoiceHover}
          onForcedPanningChange={props.onForcedPanningChange}
          drumVoices={props.drumVoices}
          nativeDrumVoices={props.nativeDrumVoices}
          onToggleVoiceDrum={props.onToggleVoiceDrum}
          excludedVoices={props.excludedVoices}
          onToggleVoiceExcluded={props.onToggleVoiceExcluded}
          slug={slug}
          currentTonic={currentTonic}
        />
      )}
    </div>
  );
};
