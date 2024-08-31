import React, { useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import ErrorBoundary from "../ErrorBoundary";
import {
  Analysis,
  CompressedNotes,
  deltaCoding,
  FrozenNotesType,
  PitchClass,
  rehydrateAnalysis,
  rehydrateNotes,
  Snippet,
  TIME_SCALE_FACTOR,
} from "./analysis";
import EnhancedFrozenNotes from "./FrozenNotes";
import { getModulations } from "./Rawl";
import SnippetList from "./SnippetList";
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

const SnippetListContainer = styled.div`
  margin-top: 20px;
  border-top: 1px solid #444;
  padding-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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
          Math.min(value, measuresAndBeats?.measures.length || 1),
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
    [measuresAndBeats],
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

  const createFrozenNotes = useCallback((): FrozenNotesType | null => {
    if (!frozenNotes || !measuresAndBeats || !analysis) {
      console.error("Missing required props in createFrozenNotes");
      return null;
    }

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

  const snippet: Snippet | null = useMemo(() => {
    const frozenNotesData = createFrozenNotes();
    if (!frozenNotesData) return null;

    return {
      tag: tagName,
      frozenNotes: frozenNotesData,
      measuresSpan: [measureRange[0], measureRange[1]],
    };
  }, [createFrozenNotes, tagName, measureRange]);

  const exportString = useMemo(() => {
    return snippet ? JSON.stringify(snippet) : "";
  }, [snippet]);

  const saveSnippet = useCallback(() => {
    if (!snippet) return;
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
    if (!exportString) return;
    navigator.clipboard.writeText(exportString).then(() => {
      setCopyIndicatorVisible(true);
      setTimeout(() => setCopyIndicatorVisible(false), 2000);
    });
  }, [exportString]);

  const measureWidth = 50; // Fixed width for each measure
  const noteHeight = 3; // Match the initial value in StackedSystemLayout

  const midiRange = useMemo(() => {
    if (!snippet) return [0, 0] as [number, number];

    let min = Infinity;
    let max = -Infinity;
    const rehydratedNotes = rehydrateNotes(snippet);
    rehydratedNotes.forEach((voiceNotes) => {
      voiceNotes.forEach((note) => {
        const midiNumber = note.note.midiNumber;
        min = Math.min(min, midiNumber);
        max = Math.max(max, midiNumber);
      });
    });
    return [min, max] as [number, number];
  }, [snippet]);

  const height = (midiRange[1] - midiRange[0] + 1) * noteHeight;

  const midiNumberToY = useCallback(
    (midiNumber: number) => height - (midiNumber - midiRange[0]) * noteHeight,
    [height, midiRange, noteHeight],
  );

  // Calculate maxWidth based on the number of measures
  const maxWidth = (measureRange[1] - measureRange[0] + 1) * measureWidth;

  // Pad only the measures array for correct numbering
  const paddedMeasuresAndBeats = useMemo(() => {
    if (!snippet) return { measures: [], beats: [] };

    const startMeasure = measureRange[0] - 1;
    const endMeasure = measureRange[1];

    // Ensure we don't create an array with negative length
    const paddingLength = Math.max(0, startMeasure);

    // Slice the measures array to include only the selected range
    const slicedMeasures = rehydrateAnalysis(
      snippet.frozenNotes.analysis,
    ).measuresAndBeats.measures.slice(0, endMeasure + 1);

    const paddedMeasures = [
      ...Array(paddingLength).fill(
        rehydrateAnalysis(snippet.frozenNotes.analysis).measuresAndBeats
          .measures[0] || 0,
      ),
      ...slicedMeasures,
    ];

    return {
      ...rehydrateAnalysis(snippet.frozenNotes.analysis).measuresAndBeats,
      measures: paddedMeasures,
    };
  }, [snippet, renderKey]); // Add renderKey as a dependency

  const isValidRange = useMemo(() => {
    return (
      !isNaN(measureRange[0]) &&
      !isNaN(measureRange[1]) &&
      measureRange[0] > 0 &&
      measureRange[1] > 0 &&
      measureRange[0] <= measureRange[1] &&
      measureRange[1] <= (measuresAndBeats?.measures.length || 0)
    );
  }, [measureRange, measuresAndBeats]);

  // Add this check after all hooks have been called
  if (!frozenNotes || !measuresAndBeats || !analysis) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
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
          {isValidRange && snippet ? (
            <>
              <h3>Rehydrated Notes</h3>
              <EnhancedFrozenNotes
                key={renderKey}
                notes={rehydrateNotes(snippet)}
                measureWidth={measureWidth}
                midiNumberToY={midiNumberToY}
                maxWidth={maxWidth}
                analysis={
                  rehydrateAnalysis(snippet.frozenNotes.analysis).analysis
                }
                measuresAndBeats={paddedMeasuresAndBeats}
                noteHeight={noteHeight}
                startMeasure={measureRange[0]}
              />
              <JsonDisplay onClick={copyToClipboard}>
                {exportString}
              </JsonDisplay>
              <button onClick={saveSnippet} style={{ marginTop: "10px" }}>
                Save Snippet
              </button>
            </>
          ) : (
            <ErrorMessage>
              {error ||
                "Please enter a valid measure range to display frozen notes."}
            </ErrorMessage>
          )}
        </FrozenNotesDisplay>
        <CopyIndicator visible={copyIndicatorVisible}>
          {copyIndicatorVisible ? "Snippet saved!" : "Copied to clipboard!"}
        </CopyIndicator>
        <SnippetListContainer>
          <h3>Saved Snippets</h3>
          <SnippetList
            snippets={analysis.snippets || []}
            deleteSnippet={deleteSnippet}
            measureWidth={measureWidth}
            noteHeight={noteHeight}
          />
        </SnippetListContainer>
        {isValidRange && snippet && (
          <RehydratedNotesDisplay>
            <pre>{JSON.stringify(rehydrateNotes(snippet), null, 2)}</pre>
          </RehydratedNotesDisplay>
        )}
      </Container>
    </ErrorBoundary>
  );
};

export default FrozenNotesLayout;
