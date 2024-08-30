import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import {
  Analysis,
  ANALYSIS_STUB,
  CompressedNotes,
  DeltaCoded,
  deltaCoding,
  deltaDecoding,
  FrozenAnalysis,
  FrozenNotesType,
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

const SnippetList = styled.div`
  margin-top: 20px;
  border-top: 1px solid #444;
  padding-top: 20px;
`;

const SnippetItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  margin-top: 10px;
`;

interface FrozenNotesLayoutProps extends SystemLayoutProps {
  saveAnalysis: (analysis: Analysis) => void;
}

const FrozenNotesLayout: React.FC<FrozenNotesLayoutProps> = ({
  frozenNotes,
  measuresAndBeats,
  analysis,
  saveAnalysis,
}) => {
  const [measureRange, setMeasureRange] = useState([1, 4]);
  const [copyIndicatorVisible, setCopyIndicatorVisible] = useState(false);
  const startMeasureRef = useRef<HTMLInputElement>(null);
  const [renderKey, setRenderKey] = useState(0);
  const [tagName, setTagName] = useState("tag");
  const [error, setError] = useState<string | null>(null);

  const handleRangeChange = useCallback(
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (isNaN(value)) {
        setError("Please enter valid numbers for measure range.");
        return;
      }
      setMeasureRange((prev) => {
        const newRange = [...prev];
        newRange[index] = Math.max(
          1,
          Math.min(value, measuresAndBeats.measures.length),
        );
        // Ensure start measure is not greater than end measure
        if (index === 0 && newRange[0] > newRange[1]) {
          newRange[1] = newRange[0];
        } else if (index === 1 && newRange[1] < newRange[0]) {
          newRange[0] = newRange[1];
        }
        return newRange;
      });
      setError(null);
      // Increment renderKey to force re-render
      setRenderKey((prevKey) => prevKey + 1);
    },
    [measuresAndBeats.measures.length],
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
        const lengthToNotes: CompressedNotes = {};
        voiceNotes.forEach((note) => {
          if (note.span[1] >= startTime && note.span[0] < endTime) {
            const start = Math.round(
              (note.span[0] - startTime) * TIME_SCALE_FACTOR,
            );
            const length = Math.round(
              (note.span[1] - note.span[0]) * TIME_SCALE_FACTOR,
            );
            const midiNumber = note.note.midiNumber;

            if (!lengthToNotes[length]) {
              lengthToNotes[length] = {};
            }
            if (!lengthToNotes[length][midiNumber]) {
              lengthToNotes[length][midiNumber] = [start];
            } else {
              (lengthToNotes[length][midiNumber] as number[]).push(start);
            }
          }
        });

        // Apply delta coding to the start times
        Object.values(lengthToNotes).forEach((midiNumbers) => {
          Object.keys(midiNumbers).forEach((midiNumber) => {
            const starts = midiNumbers[midiNumber] as number[];
            midiNumbers[midiNumber] = deltaCoding(starts.sort((a, b) => a - b));
          });
        });

        return lengthToNotes;
      },
    );

    const modulations = getModulations(analysis);
    // Find the latest modulation that occurs before or at the start measure
    const initialModulation = modulations
      .filter((mod) => mod.measure <= startMeasure)
      .reduce(
        (latest, current) =>
          current.measure > latest.measure ? current : latest,
        { measure: -1, tonic: 0 as PitchClass }, // Default to C if no previous modulations
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
        measures: deltaCoding(
          measuresAndBeats.measures
            .slice(startMeasure, endMeasure + 2)
            .map((time) => Math.round((time - startTime) * TIME_SCALE_FACTOR)),
        ),
        beats: deltaCoding(
          measuresAndBeats.beats
            .filter((time) => time >= startTime && time < endTime)
            .map((time) => Math.round((time - startTime) * TIME_SCALE_FACTOR)),
        ),
      },
    };

    return {
      notesInVoices,
      analysis: frozenAnalysis,
    };
  }, [frozenNotes, measureRange, measuresAndBeats, analysis]);

  const snippet: Snippet = {
    tag: tagName,
    frozenNotes: createFrozenNotes(),
    measuresSpan: [measureRange[0], measureRange[1]],
  };

  const exportString = JSON.stringify(snippet);

  const saveSnippet = useCallback(() => {
    const updatedAnalysis: Analysis = {
      ...analysis,
      snippets: [...(analysis.snippets || []), snippet],
    };
    saveAnalysis(updatedAnalysis);
    setCopyIndicatorVisible(true);
    setTimeout(() => setCopyIndicatorVisible(false), 2000);
  }, [analysis, saveAnalysis, snippet]);

  const deleteSnippet = useCallback(
    (index: number) => {
      const updatedAnalysis: Analysis = {
        ...analysis,
        snippets: (analysis.snippets || []).filter((_, i) => i !== index),
      };
      saveAnalysis(updatedAnalysis);
    },
    [analysis, saveAnalysis],
  );

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
    let nextId = 1; // Initialize a counter for unique IDs

    return frozenNotes.notesInVoices.map((voice, voiceIndex) => {
      const notes: Note[] = [];
      Object.entries(voice).forEach(([length, midiNumbers]) => {
        Object.entries(midiNumbers).forEach(([midiNumber, starts]) => {
          const decodedStarts = deltaDecoding(starts as DeltaCoded<number>);
          decodedStarts.forEach((start) => {
            const startTime = start / TIME_SCALE_FACTOR;
            const lengthTime = parseInt(length) / TIME_SCALE_FACTOR;
            const absoluteSpan: [number, number] = [
              startTime,
              startTime + lengthTime,
            ];
            notes.push({
              note: { midiNumber: parseInt(midiNumber) },
              id: nextId++, // Use the incrementing ID
              isDrum: false,
              span: absoluteSpan,
              voiceIndex,
            });
          });
        });
      });
      return notes;
    });
  };

  const rehydrateAnalysis = (
    frozenAnalysis: FrozenAnalysis,
  ): {
    analysis: Analysis;
    measuresAndBeats: MeasuresAndBeats;
  } => {
    const rehydratedMeasuresAndBeats = {
      measures: deltaDecoding(frozenAnalysis.measuresAndBeats.measures).map(
        (time) => time / TIME_SCALE_FACTOR,
      ),
      beats: deltaDecoding(frozenAnalysis.measuresAndBeats.beats).map(
        (time) => time / TIME_SCALE_FACTOR,
      ),
    };

    return {
      analysis: {
        ...ANALYSIS_STUB,
        modulations: Object.fromEntries(
          Object.entries(frozenAnalysis.modulations).map(([measure, tonic]) => [
            measure,
            tonic as PitchClass,
          ]),
        ),
      },
      measuresAndBeats: rehydratedMeasuresAndBeats,
    };
  };

  const { rehydratedNotes, rehydratedAnalysis, rehydratedMeasuresAndBeats } =
    useMemo(() => {
      const rehydratedNotes = rehydrateNotes(snippet);
      const {
        analysis: rehydratedAnalysis,
        measuresAndBeats: rehydratedMeasuresAndBeats,
      } = rehydrateAnalysis(snippet.frozenNotes.analysis);
      return {
        rehydratedNotes,
        rehydratedAnalysis,
        rehydratedMeasuresAndBeats,
      };
    }, [snippet, renderKey]); // Add renderKey as a dependency

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

  // Pad only the measures array for correct numbering
  const paddedMeasuresAndBeats = useMemo(() => {
    const startMeasure = measureRange[0] - 1;
    const endMeasure = measureRange[1];

    // Ensure we don't create an array with negative length
    const paddingLength = Math.max(0, startMeasure);

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
  }, [rehydratedMeasuresAndBeats, measureRange]);

  const isValidRange = useMemo(() => {
    return (
      !isNaN(measureRange[0]) &&
      !isNaN(measureRange[1]) &&
      measureRange[0] > 0 &&
      measureRange[1] > 0 &&
      measureRange[0] <= measureRange[1] &&
      measureRange[1] <= measuresAndBeats.measures.length
    );
  }, [measureRange, measuresAndBeats.measures.length]);

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
          <label>
            Tag:
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              style={{ marginLeft: "10px", width: "100px" }}
            />
          </label>
        </RangeInputs>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {isValidRange ? (
          <>
            <h3>Rehydrated Notes</h3>
            <EnhancedFrozenNotes
              key={renderKey}
              notes={rehydratedNotes}
              measureWidth={measureWidth}
              midiNumberToY={midiNumberToY}
              maxWidth={maxWidth}
              analysis={rehydratedAnalysis}
              measuresAndBeats={paddedMeasuresAndBeats}
              noteHeight={noteHeight}
              startMeasure={measureRange[0]}
            />
            <JsonDisplay onClick={copyToClipboard}>{exportString}</JsonDisplay>
            <button onClick={saveSnippet} style={{ marginTop: "10px" }}>
              Save Snippet
            </button>
          </>
        ) : (
          <ErrorMessage>
            Please enter a valid measure range to display frozen notes.
          </ErrorMessage>
        )}
      </FrozenNotesDisplay>
      <CopyIndicator visible={copyIndicatorVisible}>
        {copyIndicatorVisible ? "Snippet saved!" : "Copied to clipboard!"}
      </CopyIndicator>
      <SnippetList>
        <h3>Saved Snippets</h3>
        {analysis.snippets?.map((savedSnippet, index) => (
          <SnippetItem key={index}>
            <span>
              {savedSnippet.tag} (Measures:{" "}
              {savedSnippet.measuresSpan.join("-")})
            </span>
            <button onClick={() => deleteSnippet(index)}>Delete</button>
          </SnippetItem>
        ))}
      </SnippetList>
      {isValidRange && (
        <RehydratedNotesDisplay>
          <pre>{JSON.stringify(rehydratedNotes, null, 2)}</pre>
        </RehydratedNotesDisplay>
      )}
    </Container>
  );
};

export default FrozenNotesLayout;
