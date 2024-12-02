import React, { useCallback, useContext, useMemo } from "react";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import { Snippet, rehydrateSnippet } from "./analysis";
import EnhancedFrozenNotes from "./FrozenNotes";

const PX_IN_MEASURE = 100;

const SnippetItemContainer = styled.div<{
  width: number;
  isPreview?: boolean;
  isPreviewWithoutTime?: boolean;
}>`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.width}px;
  border-top: ${(props) => {
    if (props.isPreviewWithoutTime) return "1px solid red";
    return props.isPreview ? "none" : "1px solid #444";
  }};
  border-bottom: ${(props) => {
    if (props.isPreviewWithoutTime) return "1px solid red";
    return props.isPreview ? "none" : "1px solid #444";
  }};
  border-left: ${(props) => {
    if (props.isPreviewWithoutTime) return "1px solid red";
    return props.isPreview ? "none" : "1px solid #444";
  }};
  border-radius: ${(props) => (props.isPreview ? "0" : "5px")};
  overflow: hidden;
`;

const SnippetHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #222;
`;

const TimingInfo = styled.div`
  color: #888;
  font-size: 0.8em;
  margin-top: 4px;
  text-align: center;
`;

const SnippetContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
`;

const DeleteButton = styled.button`
  background-color: #ff4136;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    background-color: #ff7066;
  }
`;

const PlaybackCursor = styled.div`
  position: absolute;
  width: 2px;
  height: 100%;
  background-color: #ff6b00;
  pointer-events: none;
  transition: transform 0.74s linear;
  z-index: 9999;
  opacity: 0.8;
  top: 0;
  left: 0;
  will-change: transform;
  transform: translateX(0);
  backface-visibility: hidden;
`;

interface SnippetItemProps {
  snippet: Snippet;
  index: number;
  deleteSnippet?: (index: number) => void;
  noteHeight: number;
  isPreview?: boolean;
}

const SnippetItem: React.FC<SnippetItemProps> = ({
  snippet,
  index,
  deleteSnippet,
  noteHeight,
  isPreview = false,
}) => {
  const appContext = useContext(AppContext);
  const { currentMidi } = appContext;

  const { rehydratedNotes, rehydratedAnalysis, rehydratedMeasuresAndBeats } =
    useMemo(() => rehydrateSnippet(snippet), [snippet]);

  const paddedMeasuresAndBeats = useMemo(() => {
    const startMeasure = snippet.measuresSpan[0];
    const endMeasure = snippet.measuresSpan[1];

    // Ensure we don't create an array with negative length
    const paddingLength = Math.max(0, startMeasure - 1);

    // Slice the measures array to include only the selected range
    const slicedMeasures = rehydratedMeasuresAndBeats.measures.slice(
      0,
      endMeasure + 1,
    );

    const paddedMeasures = [
      ...Array(paddingLength).fill(rehydratedMeasuresAndBeats.measures[0] || 0),
      ...slicedMeasures,
    ];

    return {
      ...rehydratedMeasuresAndBeats,
      measures: paddedMeasures,
    };
  }, [snippet, rehydratedMeasuresAndBeats]);

  const snippetMidiRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    rehydratedNotes.forEach((voiceNotes) => {
      voiceNotes.forEach((note) => {
        const midiNumber = note.note.midiNumber;
        min = Math.min(min, midiNumber);
        max = Math.max(max, midiNumber);
      });
    });
    return [min, max] as [number, number];
  }, [rehydratedNotes]);

  const snippetMidiNumberToY = useCallback(
    (midiNumber: number) => (snippetMidiRange[1] - midiNumber + 1) * noteHeight,
    [snippetMidiRange, noteHeight],
  );

  const timeRange = useMemo(() => {
    const startMeasure = snippet.measuresSpan[0];
    const endMeasure = snippet.measuresSpan[1];
    const startTime = paddedMeasuresAndBeats.measures[startMeasure - 1] || 0;
    const endTime = paddedMeasuresAndBeats.measures[endMeasure] || startTime;
    return [startTime, endTime] as [number, number];
  }, [snippet, paddedMeasuresAndBeats]);

  const containerWidth = useMemo(() => {
    return (rehydratedMeasuresAndBeats.measures.length - 1) * PX_IN_MEASURE;
  }, [timeRange]);

  const toX = useCallback(
    (seconds: number) => {
      const normalizedTime =
        (seconds - timeRange[0]) / (timeRange[1] - timeRange[0]);
      return isNaN(normalizedTime) ? 0 : normalizedTime * containerWidth; // Use containerWidth instead of 400
    },
    [timeRange, containerWidth],
  );

  const isCurrentlyPlaying = useMemo(() => {
    const snippetSlug = (snippet as any).composerSlug;
    if (!currentMidi || !snippet.secondsSpan) return false;

    const isPlaying = currentMidi.slug === snippetSlug;
    if (isPlaying && appContext.currentPlaybackTime !== null) {
      console.log("Playing snippet:", {
        tag: snippet.tag,
        timeRange: snippet.secondsSpan,
        currentTime: appContext.currentPlaybackTime,
        snippetSlug,
        currentMidiSlug: currentMidi.slug,
      });
    }
    return isPlaying;
  }, [currentMidi, snippet, appContext.currentPlaybackTime]);

  const cursorPosition = useMemo(() => {
    if (
      !isCurrentlyPlaying ||
      !snippet.secondsSpan ||
      appContext.currentPlaybackTime === null ||
      appContext.currentPlaybackTime < snippet.secondsSpan[0]
    ) {
      return null;
    }

    const [start, end] = snippet.secondsSpan;
    const currentTime = appContext.currentPlaybackTime;

    // Calculate position as a percentage of the time range
    const timeProgress = (currentTime - start) / (end - start);
    const xPos = timeProgress * containerWidth;

    console.log("Cursor calculation:", {
      currentTime,
      timeRange: snippet.secondsSpan,
      timeProgress,
      xPos,
      containerWidth,
    });

    return xPos;
  }, [
    isCurrentlyPlaying,
    snippet.secondsSpan,
    appContext.currentPlaybackTime,
    containerWidth,
  ]);

  return (
    <SnippetItemContainer
      width={containerWidth}
      isPreview={isPreview}
      isPreviewWithoutTime={
        false && isPreview && snippet.secondsSpan === undefined
      }
    >
      {!isPreview && (
        <SnippetHeader>
          {deleteSnippet && (
            <DeleteButton onClick={() => deleteSnippet(index)}>
              Delete
            </DeleteButton>
          )}
          <span>
            {snippet.tag.replace(":", ": ")}{" "}
            <span style={{ color: "gray" }}>
              {snippet.measuresSpan.join("..")}
            </span>
          </span>
          {snippet.secondsSpan &&
            Array.isArray(snippet.secondsSpan) &&
            typeof snippet.secondsSpan[0] === "number" && (
              <TimingInfo>
                {snippet.secondsSpan[0].toFixed(2)}s -{" "}
                {snippet.secondsSpan[1].toFixed(2)}s
              </TimingInfo>
            )}
        </SnippetHeader>
      )}
      <SnippetContent style={{ position: "relative" }}>
        {cursorPosition !== null && (
          <PlaybackCursor
            style={{
              transform: `translateX(${cursorPosition}px)`,
            }}
          />
        )}
        <EnhancedFrozenNotes
          notes={rehydratedNotes}
          midiNumberToY={snippetMidiNumberToY}
          maxWidth={containerWidth}
          analysis={rehydratedAnalysis}
          measuresAndBeats={paddedMeasuresAndBeats}
          noteHeight={noteHeight}
          startMeasure={snippet.measuresSpan[0]}
          toX={toX}
          timeRange={timeRange}
          isPreview={isPreview}
        />
      </SnippetContent>
    </SnippetItemContainer>
  );
};

export default SnippetItem;
