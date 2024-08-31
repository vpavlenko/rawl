import React, { useCallback, useMemo, useState } from "react";
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
  const [dataRange, setDataRange] = useState<[number, number]>([1, 4]);
  const [inputRange, setInputRange] = useState<[string, string]>(["1", "4"]);
  const [tagName, setTagName] = useState("tag");
  const [error, setError] = useState<string | null>(null);
  const [copyIndicatorVisible, setCopyIndicatorVisible] = useState(false);

  const maxMeasure = measuresAndBeats?.measures.length || 1;

  const validateAndUpdateRange = useCallback(
    (newRange: [string, string]) => {
      const [start, end] = newRange.map((val) => {
        const num = parseInt(val, 10);
        return isNaN(num) ? 0 : Math.max(1, Math.min(num, maxMeasure));
      });

      if (start > 0 && end > 0 && start <= end) {
        setDataRange([start, end]);
        setError(null);
      } else {
        setError("Please enter a valid measure range.");
      }
    },
    [maxMeasure],
  );

  const handleRangeChange = useCallback(
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const newRange = [...inputRange] as [string, string];
      newRange[index] = newValue;
      setInputRange(newRange);

      if (newValue !== "") {
        validateAndUpdateRange(newRange);
      }
    },
    [inputRange, validateAndUpdateRange],
  );

  const handleRangeBlur = useCallback(
    (index: number) => () => {
      const newRange = [...inputRange] as [string, string];
      if (newRange[index] === "") {
        newRange[index] = index === 0 ? "1" : maxMeasure.toString();
      }
      setInputRange(newRange);
      validateAndUpdateRange(newRange);
    },
    [inputRange, maxMeasure, validateAndUpdateRange],
  );

  const createFrozenNotes = useCallback((): FrozenNotesType | null => {
    if (!frozenNotes || !measuresAndBeats || !analysis) {
      console.error("Missing required props in createFrozenNotes");
      return null;
    }

    const startMeasure = Math.max(0, dataRange[0] - 1);
    const endMeasure = Math.min(dataRange[1], maxMeasure) - 1;

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
  }, [frozenNotes, dataRange, measuresAndBeats, analysis, maxMeasure]);

  const snippet: Snippet | null = useMemo(() => {
    const frozenNotesData = createFrozenNotes();
    if (!frozenNotesData) return null;

    return {
      tag: tagName,
      frozenNotes: frozenNotesData,
      measuresSpan: dataRange,
    };
  }, [createFrozenNotes, tagName, dataRange]);

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
  const maxWidth = (dataRange[1] - dataRange[0] + 1) * measureWidth;

  // Pad only the measures array for correct numbering
  const paddedMeasuresAndBeats = useMemo(() => {
    if (!snippet) return { measures: [], beats: [] };

    const start = dataRange[0];
    const end = dataRange[1];

    const startMeasure = Math.max(0, start - 1);
    const endMeasure = Math.min(end, measuresAndBeats?.measures.length || 1);

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
  }, [snippet, dataRange, measuresAndBeats]);

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
              max={maxMeasure}
              value={inputRange[0]}
              onChange={handleRangeChange(0)}
              onBlur={handleRangeBlur(0)}
            />
            <span>to</span>
            <NumberInput
              type="number"
              min="1"
              max={maxMeasure}
              value={inputRange[1]}
              onChange={handleRangeChange(1)}
              onBlur={handleRangeBlur(1)}
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
          {!error && snippet && (
            <>
              <h3>Rehydrated Notes</h3>
              <EnhancedFrozenNotes
                notes={rehydrateNotes(snippet)}
                measureWidth={measureWidth}
                midiNumberToY={midiNumberToY}
                maxWidth={maxWidth}
                analysis={
                  rehydrateAnalysis(snippet.frozenNotes.analysis).analysis
                }
                measuresAndBeats={paddedMeasuresAndBeats}
                noteHeight={noteHeight}
                startMeasure={dataRange[0]}
              />
              <JsonDisplay onClick={copyToClipboard}>
                {exportString}
              </JsonDisplay>
              <button onClick={saveSnippet} style={{ marginTop: "10px" }}>
                Save Snippet
              </button>
            </>
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
        {snippet && (
          <RehydratedNotesDisplay>
            <pre>{JSON.stringify(rehydrateNotes(snippet), null, 2)}</pre>
          </RehydratedNotesDisplay>
        )}
      </Container>
    </ErrorBoundary>
  );
};

export default FrozenNotesLayout;
