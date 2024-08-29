import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import {
  Analysis,
  ANALYSIS_STUB,
  FrozenAnalysis,
  FrozenNotes as FrozenNotesType,
  PitchClass,
  Snippet,
} from "./analysis";
import EnhancedFrozenNotes from "./FrozenNotes";
import { Note } from "./parseMidi";
import { getModulations } from "./Rawl";
import { MeasuresAndBeats, SystemLayoutProps } from "./SystemLayout";

const TIME_SCALE_FACTOR = 100;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: black;
  color: white;
`;

const FrozenNotesDisplay = styled.div`
  margin-bottom: 20px;
`;

const JsonDisplay = styled.pre`
  white-space: pre-wrap;
  word-break: break-all;
  cursor: pointer;
  &:active {
    background-color: #333;
  }
  font-size: 8px;
`;

const RangeInputs = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const NumberInput = styled.input`
  width: 60px;
  margin-right: 10px;
`;

const CopyIndicator = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.3s;
`;

const RehydratedNotesDisplay = styled.div`
  margin-top: 20px;
  border-top: 1px solid #444;
  padding-top: 20px;
`;

const FrozenNotesLayout: React.FC<SystemLayoutProps> = ({
  frozenNotes,
  measuresAndBeats,
  analysis,
}) => {
  const [measureRange, setMeasureRange] = useState([1, 4]);
  const [copyIndicatorVisible, setCopyIndicatorVisible] = useState(false);
  const startMeasureRef = useRef<HTMLInputElement>(null);

  const handleRangeChange = useCallback(
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      setMeasureRange((prev) => {
        const newRange = [...prev];
        newRange[index] = value;
        return newRange;
      });
    },
    [],
  );

  React.useEffect(() => {
    if (startMeasureRef.current) {
      startMeasureRef.current.focus();
      setTimeout(() => {
        if (startMeasureRef.current) {
          startMeasureRef.current.blur();
          startMeasureRef.current.focus();
        }
      }, 0);
    }
  }, []);

  const createFrozenNotes = useCallback((): FrozenNotesType => {
    const startMeasure = measureRange[0] - 1;
    const endMeasure = measureRange[1] - 1;
    const startTime = measuresAndBeats.measures[startMeasure];
    const endTime = measuresAndBeats.measures[endMeasure + 1];

    const notesInVoices: FrozenNotesType["notesInVoices"] = frozenNotes.map(
      (voiceNotes) => {
        const midiNumberToNoteSpans: {
          [midiNumber: number]: [number, number][];
        } = {};
        voiceNotes.forEach((note) => {
          if (note.span[1] >= startTime && note.span[0] < endTime) {
            const midiNumber = note.note.midiNumber;
            if (!midiNumberToNoteSpans[midiNumber]) {
              midiNumberToNoteSpans[midiNumber] = [];
            }
            midiNumberToNoteSpans[midiNumber].push([
              Math.round((note.span[0] - startTime) * TIME_SCALE_FACTOR),
              Math.round((note.span[1] - startTime) * TIME_SCALE_FACTOR),
            ]);
          }
        });
        return midiNumberToNoteSpans;
      },
    );

    const modulations = getModulations(analysis);

    // Find the latest modulation that occurs before or at the start measure
    const initialModulation = modulations
      .filter((mod) => mod.measure <= startMeasure)
      .reduce(
        (latest, current) =>
          current.measure > latest.measure ? current : latest,
        { measure: 0, tonic: 0 as PitchClass }, // Default to C if no previous modulations
      );

    // Get all modulations within our slice, including the initial one
    const relevantModulations = [
      initialModulation,
      ...modulations.filter(
        (mod) => mod.measure > startMeasure && mod.measure <= endMeasure,
      ),
    ];

    const frozenAnalysis: FrozenNotesType["analysis"] = {
      modulations: Object.fromEntries(
        relevantModulations.map((mod) => [
          mod.measure === initialModulation.measure
            ? 1
            : mod.measure - startMeasure + 1,
          mod.tonic,
        ]),
      ),
      measuresAndBeats: {
        measures: measuresAndBeats.measures
          .slice(startMeasure, endMeasure + 2)
          .map((time) => Math.round((time - startTime) * TIME_SCALE_FACTOR)),
        beats: measuresAndBeats.beats
          .filter((time) => time >= startTime && time < endTime)
          .map((time) => Math.round((time - startTime) * TIME_SCALE_FACTOR)),
      },
    };

    return {
      notesInVoices,
      analysis: frozenAnalysis,
    };
  }, [frozenNotes, measureRange, measuresAndBeats, analysis]);

  const snippet: Snippet = {
    tag: "tag",
    frozenNotes: createFrozenNotes(),
    measuresSpan: [measureRange[0], measureRange[1]],
  };

  const exportString = JSON.stringify(snippet);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(exportString).then(() => {
      setCopyIndicatorVisible(true);
      setTimeout(() => setCopyIndicatorVisible(false), 2000);
    });
  }, [exportString]);

  const measureWidth = 50; // Fixed width for each measure
  const noteHeight = 3; // Match the initial value in StackedSystemLayout

  const rehydrateNotes = (snippet: Snippet): Note[][] => {
    const { frozenNotes } = snippet;

    return frozenNotes.notesInVoices.map((voice, voiceIndex) => {
      const notes: Note[] = [];
      Object.entries(voice).forEach(([midiNumber, spans]) => {
        spans.forEach((span, index) => {
          const absoluteSpan: [number, number] = [
            span[0] / TIME_SCALE_FACTOR,
            span[1] / TIME_SCALE_FACTOR,
          ];
          notes.push({
            note: { midiNumber: parseInt(midiNumber) },
            id: voiceIndex * 1000 + parseInt(midiNumber) * 100 + index,
            isDrum: false,
            span: absoluteSpan,
            voiceIndex,
          });
        });
      });
      return notes;
    });
  };

  const rehydratedNotes = rehydrateNotes(snippet);

  const midiRange = useMemo(() => {
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

  const height = (midiRange[1] - midiRange[0] + 1) * noteHeight;

  const midiNumberToY = useCallback(
    (midiNumber: number) => height - (midiNumber - midiRange[0]) * noteHeight,
    [height, midiRange, noteHeight],
  );

  // Calculate maxWidth based on the number of measures
  const maxWidth = (measureRange[1] - measureRange[0] + 1) * measureWidth;

  const rehydrateAnalysis = (
    frozenAnalysis: FrozenAnalysis,
    startMeasure: number,
  ): {
    analysis: Analysis;
    measuresAndBeats: MeasuresAndBeats;
  } => {
    const rehydratedMeasuresAndBeats = {
      measures: frozenAnalysis.measuresAndBeats.measures.map(
        (time) => time / TIME_SCALE_FACTOR,
      ),
      beats: frozenAnalysis.measuresAndBeats.beats.map(
        (time) => time / TIME_SCALE_FACTOR,
      ),
    };

    return {
      analysis: {
        ...ANALYSIS_STUB,
        modulations: Object.fromEntries(
          Object.entries(frozenAnalysis.modulations).map(([measure, tonic]) => [
            measure, // Keep the measure numbers as they are in the frozen analysis
            tonic as PitchClass,
          ]),
        ),
      },
      measuresAndBeats: rehydratedMeasuresAndBeats,
    };
  };

  const {
    analysis: rehydratedAnalysis,
    measuresAndBeats: rehydratedMeasuresAndBeats,
  } = rehydrateAnalysis(snippet.frozenNotes.analysis, measureRange[0]);

  return (
    <Container>
      <FrozenNotesDisplay>
        <h2>Frozen Notes</h2>
        <RangeInputs>
          <label>Measures:</label>
          <NumberInput
            type="number"
            min="1"
            max={measuresAndBeats.measures.length}
            value={measureRange[0]}
            onChange={handleRangeChange(0)}
            ref={startMeasureRef}
          />
          <span>to</span>
          <NumberInput
            type="number"
            min="1"
            max={measuresAndBeats.measures.length}
            value={measureRange[1]}
            onChange={handleRangeChange(1)}
          />
        </RangeInputs>
        <h3>Rehydrated Notes</h3>
        <EnhancedFrozenNotes
          notes={rehydratedNotes}
          measureWidth={measureWidth}
          midiNumberToY={midiNumberToY}
          maxWidth={maxWidth}
          analysis={rehydratedAnalysis}
          measuresAndBeats={rehydratedMeasuresAndBeats}
          noteHeight={noteHeight}
          startMeasure={measureRange[0]}
        />
      </FrozenNotesDisplay>
      <JsonDisplay onClick={copyToClipboard}>{exportString}</JsonDisplay>
      <CopyIndicator visible={copyIndicatorVisible}>
        Copied to clipboard!
      </CopyIndicator>
      <RehydratedNotesDisplay>
        <pre>{JSON.stringify(rehydratedNotes, null, 2)}</pre>
      </RehydratedNotesDisplay>
    </Container>
  );
};

export default FrozenNotesLayout;
