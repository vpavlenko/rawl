import React, { useCallback, useRef, useState } from "react";
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
import { ColoredNote } from "./parseMidi";
import { getModulations } from "./Rawl";
import { SystemLayoutProps } from "./SystemLayout";

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

  const filteredNotes = React.useMemo(
    () =>
      frozenNotes.map((voiceNotes) =>
        voiceNotes.filter((note) => {
          const startMeasure = measureRange[0] - 1;
          const endMeasure = measureRange[1] - 1;
          return (
            note.span[1] >= measuresAndBeats.measures[startMeasure] &&
            note.span[0] + 1e-2 < measuresAndBeats.measures[endMeasure + 1]
          );
        }),
      ),
    [frozenNotes, measureRange, measuresAndBeats],
  );

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
              note.span[0] - startTime,
              note.span[1] - startTime,
            ]);
          }
        });
        return midiNumberToNoteSpans;
      },
    );

    const modulations = getModulations(analysis);
    const relevantModulations = modulations.filter(
      (mod) => mod.measure >= startMeasure && mod.measure <= endMeasure,
    );
    if (
      relevantModulations.length === 0 ||
      relevantModulations[0].measure > startMeasure
    ) {
      const lastPreviousTonic = modulations
        .filter((mod) => mod.measure <= startMeasure)
        .reduce(
          (prev, current) => (current.measure > prev.measure ? current : prev),
          modulations[0],
        );
      relevantModulations.unshift({
        measure: startMeasure,
        tonic: lastPreviousTonic.tonic,
      });
    }

    const frozenAnalysis: FrozenNotesType["analysis"] = {
      modulations: Object.fromEntries(
        relevantModulations.map((mod) => [
          mod.measure - startMeasure + 1,
          mod.tonic,
        ]),
      ),
      measuresAndBeats: {
        measures: measuresAndBeats.measures
          .slice(startMeasure, endMeasure + 2)
          .map((time) => time - startTime),
        beats: measuresAndBeats.beats
          .filter((time) => time >= startTime && time < endTime)
          .map((time) => time - startTime),
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
  const midiNumberToY = (midiNumber: number) => (127 - midiNumber) * 4;

  // Calculate maxWidth based on the number of measures
  const maxWidth = (measureRange[1] - measureRange[0] + 1) * measureWidth;

  // Rehydrate function
  const rehydrateNotes = (snippet: Snippet): ColoredNote[][] => {
    const { frozenNotes, measuresSpan } = snippet;
    const startTime = measuresAndBeats.measures[measuresSpan[0] - 1];
    const modulations = getModulations(analysis);

    return frozenNotes.notesInVoices.map((voice, voiceIndex) => {
      const notes: ColoredNote[] = [];
      Object.entries(voice).forEach(([midiNumber, spans]) => {
        spans.forEach((span, index) => {
          const absoluteSpan: [number, number] = [
            span[0] + startTime,
            span[1] + startTime,
          ];
          const noteCenterTime = (absoluteSpan[0] + absoluteSpan[1]) / 2;
          const lastModulation = modulations
            .filter((mod) => mod.measure <= noteCenterTime)
            .reduce((prev, current) =>
              current.measure > prev.measure ? current : prev,
            );
          const localTonic = lastModulation.tonic as PitchClass;
          const colorNumber = (parseInt(midiNumber) - localTonic + 12) % 12;

          notes.push({
            note: { midiNumber: parseInt(midiNumber) },
            id: voiceIndex * 1000 + parseInt(midiNumber) * 100 + index,
            isDrum: false,
            span: absoluteSpan,
            voiceIndex,
            color: `noteColor_${colorNumber}_colors`,
            isActive: true,
          });
        });
      });
      return notes;
    });
  };

  const rehydratedNotes = rehydrateNotes(snippet);

  const rehydrateAnalysis = (frozenAnalysis: FrozenAnalysis): Analysis => {
    return {
      ...ANALYSIS_STUB,
      modulations: frozenAnalysis.modulations,
    };
  };

  const rehydratedAnalysis = rehydrateAnalysis(snippet.frozenNotes.analysis);

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
          measuresAndBeats={snippet.frozenNotes.analysis.measuresAndBeats}
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
