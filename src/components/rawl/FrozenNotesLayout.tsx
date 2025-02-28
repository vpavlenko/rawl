import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { components, Theme } from "react-select";
import CreatableSelect from "react-select/creatable";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import ErrorBoundary from "../ErrorBoundary";
import {
  Analysis,
  CompressedNotes,
  deltaCoding,
  FrozenNotesType,
  getPhraseStarts,
  PitchClass,
  rehydrateSnippet,
  Snippet,
  TIME_SCALE_FACTOR,
} from "./analysis";
import { getModulations, SecondsSpan } from "./Rawl";
import SnippetItem from "./SnippetItem";
import SnippetList from "./SnippetList";
import { SystemLayoutProps } from "./SystemLayout";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: black;
  color: white;
`;

const DebugContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const DebugColumn = styled.div`
  width: 48%;
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
  z-index: 9999;
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

const StyledSelect = styled(CreatableSelect).attrs({
  classNamePrefix: "react-select",
})`
  width: 600px;
  margin-left: 10px;

  .react-select__menu {
    z-index: 9999;
  }

  .react-select__option--is-focused {
    background-color: #deebff;
  }
`;

const SaveButton = styled.button<{ unsaved: boolean }>`
  margin-top: 10px;
  background-color: ${(props) => (props.unsaved ? "#4CAF50" : "#808080")};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: ${(props) => (props.unsaved ? "pointer" : "default")};
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) => (props.unsaved ? "#45a049" : "#808080")};
  }
`;

const FlashOverlay = styled.div<{ visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.5);
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 9999;
`;

// Custom components for react-select
const customComponents = {
  Option: (props) => (
    <components.Option {...props}>
      {props.isSelected ? "✓ " : ""}
      {props.label}
    </components.Option>
  ),
};

// Custom theme for react-select
const selectTheme = (theme: Theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary: "#4a90e2",
    primary75: "#4a90e2cc",
    primary50: "#4a90e280",
    primary25: "#4a90e240",
    danger: "#de350b",
    dangerLight: "#de350b40",
    neutral0: "white",
    neutral5: "#f2f2f2",
    neutral10: "#e6e6e6",
    neutral20: "#cccccc",
    neutral30: "#b3b3b3",
    neutral40: "#999999",
    neutral50: "#808080",
    neutral60: "#666666",
    neutral70: "#4d4d4d",
    neutral80: "#333333",
    neutral90: "#1a1a1a",
  },
});

// Custom styles for react-select
const selectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "white",
    borderColor: "#cccccc",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "white",
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#4a90e2" : "white",
    color: state.isSelected ? "white" : "black",
    "&:hover": {
      backgroundColor: "#f0f0f0",
      color: "black",
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "black",
  }),
  input: (provided) => ({
    ...provided,
    color: "black",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#808080",
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: "none",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#666666",
    "&:hover": {
      color: "#333333",
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "#666666",
    "&:hover": {
      color: "#333333",
    },
  }),
};

interface FrozenNotesLayoutProps extends SystemLayoutProps {
  saveAnalysis: (analysis: Analysis) => void;
}

// Add this new function to count tag occurrences
const countTagOccurrences = (
  analyses: Record<string, Analysis>,
): Record<string, number> => {
  const tagCounts: Record<string, number> = {};
  Object.values(analyses).forEach((analysis) => {
    if (analysis.snippets) {
      analysis.snippets.forEach((snippet) => {
        if (snippet.tag) {
          tagCounts[snippet.tag] = (tagCounts[snippet.tag] || 0) + 1;
        }
      });
    }
  });
  return tagCounts;
};

const MeasureTimesContainer = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #444;
`;

const MeasureTimesList = styled.pre`
  font-size: 12px;
  color: #888;
  white-space: pre-wrap;
  word-break: break-all;
`;

const updateSnippetPhraseStarts = (
  snippet: Snippet,
  analysis: Analysis,
  maxMeasures: number,
): Snippet => {
  if (!snippet.phraseStarts) {
    const allPhraseStarts = getPhraseStarts(analysis, maxMeasures);
    const snippetPhraseStarts = allPhraseStarts.filter(
      (measure) =>
        measure >= snippet.measuresSpan[0] &&
        measure <= snippet.measuresSpan[1],
    );
    return {
      ...snippet,
      phraseStarts: snippetPhraseStarts,
    };
  }
  return snippet;
};

const FrozenNotesLayout: React.FC<FrozenNotesLayoutProps> = ({
  frozenNotes,
  measuresAndBeats,
  analysis,
  saveAnalysis,
}) => {
  const { analyses } = useContext(AppContext);
  const [dataRange, setDataRange] = useState<[number, number]>([1, 4]);
  const [inputRange, setInputRange] = useState<[string, string]>(["1", "4"]);
  const [tagName, setTagName] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyIndicatorVisible, setCopyIndicatorVisible] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const [phraseStartsUpdated, setPhraseStartsUpdated] =
    useState<boolean>(false);

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

      // If measureStart > measureEnd, set measureEnd := measureStart
      if (index === 0 && parseInt(newValue, 10) > parseInt(newRange[1], 10)) {
        newRange[1] = newValue;
      }

      setInputRange(newRange);

      if (newValue !== "") {
        validateAndUpdateRange(newRange);
      }
      setUnsavedChanges(true);
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

    const notesInVoices: FrozenNotesType["notesInVoices"] = frozenNotes
      // First filter out any voice that only contains drum notes
      .filter((voiceNotes) => voiceNotes.some((note) => !note.isDrum))
      .map((voiceNotes) => {
        const lengthToNotes: CompressedNotes = {};
        // Then filter out drum notes within each voice
        voiceNotes
          .filter((note) => !note.isDrum)
          .forEach((note) => {
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
      });

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

    // Get phrase starts from the analysis for the current measure range
    const allPhraseStarts = getPhraseStarts(
      analysis,
      measuresAndBeats.measures.length,
    );
    const snippetPhraseStarts = allPhraseStarts.filter(
      (measure) => measure >= dataRange[0] && measure <= dataRange[1],
    );

    return {
      tag: tagName?.value || "",
      frozenNotes: frozenNotesData,
      measuresSpan: dataRange,
      phraseStarts: snippetPhraseStarts,
    };
  }, [
    createFrozenNotes,
    tagName,
    dataRange,
    analysis,
    measuresAndBeats?.measures.length,
  ]);

  const exportString = useMemo(() => {
    return snippet ? JSON.stringify(snippet) : "";
  }, [snippet]);

  const resetToDefaults = useCallback(() => {
    setInputRange(["1", "4"]);
    setDataRange([1, 4]);
    setTagName(null);
  }, []);

  const saveSnippet = useCallback(() => {
    if (!snippet) return;
    if (!tagName || !tagName.value.trim()) {
      setTagError("Please enter a tag name before saving.");
      return;
    }
    setTagError(null);
    const updatedAnalysis: Analysis = {
      ...analysis,
      snippets: [...(analysis.snippets || []), snippet],
    };
    saveAnalysis(updatedAnalysis);
    setUnsavedChanges(false);
    setFlashVisible(true);
    setTimeout(() => setFlashVisible(false), 300);

    // Reset input fields to defaults
    resetToDefaults();
  }, [analysis, saveAnalysis, snippet, tagName, resetToDefaults]);

  const deleteSnippet = useCallback(
    (index: number) => {
      const snippetToDelete = analysis.snippets?.[index];
      const updatedAnalysis: Analysis = {
        ...analysis,
        snippets: (analysis.snippets || []).filter((_, i) => i !== index),
      };
      saveAnalysis(updatedAnalysis);

      // Set the measure range of the deleted snippet into input fields
      if (snippetToDelete && snippetToDelete.measuresSpan) {
        const [start, end] = snippetToDelete.measuresSpan;
        setInputRange([start.toString(), end.toString()]);
        setDataRange([start, end]);
      }

      // Clear the tag name
      setTagName(null);

      // Set unsaved changes to true
      setUnsavedChanges(true);

      // Set focus to the tag input
      setTimeout(() => {
        if (selectRef.current) {
          selectRef.current.focus();
        }
      }, 0);
    },
    [analysis, saveAnalysis, setInputRange, setDataRange],
  );

  const copyToClipboard = useCallback(() => {
    if (!exportString) return;
    navigator.clipboard.writeText(exportString).then(() => {
      setCopyIndicatorVisible(true);
      setTimeout(() => setCopyIndicatorVisible(false), 2000);
    });
  }, [exportString]);

  const noteHeight = 3; // Match the initial value in StackedSystemLayout

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    const tagCounts = countTagOccurrences(analyses);
    Object.values(analyses).forEach((analysis) => {
      if (analysis.snippets) {
        analysis.snippets.forEach((snippet) => {
          if (snippet.tag) {
            tagSet.add(snippet.tag);
          }
        });
      }
    });
    return Array.from(tagSet).map((tag) => ({
      value: tag,
      label: `${tag} (${tagCounts[tag]})`,
    }));
  }, [analyses]);

  const rehydratedSnippet = useMemo(() => {
    if (!snippet) return null;
    return rehydrateSnippet(snippet);
  }, [snippet]);

  const selectRef = useRef(null);

  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const handleSelectChange = (selectedOption, actionMeta) => {
    if (actionMeta.action === "create-option") {
      setTagName({ value: selectedOption.value, label: selectedOption.value });
    } else {
      setTagName(selectedOption as { value: string; label: string } | null);
    }
    setMenuIsOpen(false);
    setUnsavedChanges(true);

    // Move focus to Save Snippet button after creating a new tag or selecting an existing one
    setTimeout(() => {
      saveButtonRef.current?.focus();
    }, 0);
  };

  const measureStartRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (measureStartRef.current) {
      measureStartRef.current.focus();
      measureStartRef.current.select(); // Select the content
    }
  }, []);

  // Add useEffect to handle book:index tag on entry
  useEffect(() => {
    if (!measuresAndBeats || !analysis?.snippets) return;

    const bookIndexSnippets = analysis.snippets.filter((s) =>
      s.tag.startsWith("book:index"),
    );

    const needsUpdate = bookIndexSnippets.some((s) => !s.secondsSpan);
    if (needsUpdate) {
      // Update all book:index snippets with secondsSpan
      const updatedSnippets = analysis.snippets.map((s) => {
        if (
          s.tag.startsWith("book:index") &&
          s.measuresSpan &&
          !s.secondsSpan
        ) {
          const [startMeasure, endMeasure] = s.measuresSpan;
          const startTime = measuresAndBeats.measures[startMeasure - 1];
          const endTime = measuresAndBeats.measures[endMeasure];

          return {
            ...s,
            secondsSpan: [startTime, endTime] as SecondsSpan,
          };
        }
        return s;
      });

      // Save the updated analysis
      saveAnalysis({
        ...analysis,
        snippets: updatedSnippets,
      });

      // Show toast notification
      setCopyIndicatorVisible(true);
      setTimeout(() => setCopyIndicatorVisible(false), 2000);
    }
  }, [analysis, measuresAndBeats, saveAnalysis]);

  useEffect(() => {
    if (phraseStartsUpdated || !analysis?.snippets || !measuresAndBeats) return;

    const snippetsNeedingUpdate = analysis.snippets.filter(
      (s) => !s.phraseStarts,
    );

    if (snippetsNeedingUpdate.length > 0) {
      const maxMeasures = measuresAndBeats.measures.length;
      const updatedSnippets = analysis.snippets.map((s) =>
        updateSnippetPhraseStarts(s, analysis, maxMeasures),
      );

      // Only update if there are actual changes
      if (
        JSON.stringify(updatedSnippets) !== JSON.stringify(analysis.snippets)
      ) {
        saveAnalysis({
          ...analysis,
          snippets: updatedSnippets,
        });

        setCopyIndicatorVisible(true);
        setTimeout(() => setCopyIndicatorVisible(false), 2000);
        setPhraseStartsUpdated(true);
      }
    }
  }, [analysis, measuresAndBeats, phraseStartsUpdated, saveAnalysis]);

  // Add this check after all hooks have been called
  if (!frozenNotes || !measuresAndBeats || !analysis) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <Container>
        <FlashOverlay visible={flashVisible} />
        <FrozenNotesDisplay>
          <h2>Frozen Notes</h2>
          <RangeInputs>
            <label>Measures:&nbsp;</label>
            <NumberInput
              ref={measureStartRef}
              type="number"
              min="1"
              max={maxMeasure}
              value={inputRange[0]}
              onChange={handleRangeChange(0)}
              onBlur={handleRangeBlur(0)}
            />
            <span>to&nbsp;</span>
            <NumberInput
              type="number"
              min="1"
              max={maxMeasure}
              value={inputRange[1]}
              onChange={handleRangeChange(1)}
              onBlur={handleRangeBlur(1)}
            />

            <StyledSelect
              ref={selectRef}
              value={tagName}
              onChange={(selectedOption, actionMeta) => {
                handleSelectChange(selectedOption, actionMeta);
                setUnsavedChanges(true);
              }}
              options={allTags}
              isClearable
              placeholder="Select or create a tag"
              theme={selectTheme}
              styles={selectStyles}
              components={customComponents}
              menuIsOpen={menuIsOpen}
              onMenuOpen={() => setMenuIsOpen(true)}
              onMenuClose={() => setMenuIsOpen(false)}
              onBlur={() => setMenuIsOpen(false)}
            />
          </RangeInputs>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {tagError && <ErrorMessage>{tagError}</ErrorMessage>}
          {!error && snippet && (
            <>
              <h3>Rehydrated Notes</h3>
              <SnippetItem
                snippet={snippet}
                index={-1}
                noteHeight={noteHeight}
              />
              <JsonDisplay onClick={copyToClipboard}>
                {exportString}
              </JsonDisplay>
              <SaveButton
                ref={saveButtonRef}
                onClick={saveSnippet}
                unsaved={unsavedChanges}
                disabled={!unsavedChanges}
              >
                {unsavedChanges ? "Save Snippet" : "Snippet Saved"}
              </SaveButton>
            </>
          )}
        </FrozenNotesDisplay>

        <SnippetListContainer>
          <h3>Saved Snippets</h3>
          <SnippetList
            snippets={analysis.snippets || []}
            noteHeight={noteHeight}
            onSnippetClick={() => {}}
            deleteSnippet={deleteSnippet}
          />
        </SnippetListContainer>

        <CopyIndicator visible={copyIndicatorVisible}>
          {phraseStartsUpdated
            ? `phraseStarts updated for ${analysis.snippets
                ?.filter((s) => !s.phraseStarts || s.phraseStarts.length === 0)
                .map((s) => s.tag)
                .filter(Boolean)
                .join(", ")}`
            : "Copied to clipboard!"}
        </CopyIndicator>
      </Container>
    </ErrorBoundary>
  );
};

export default FrozenNotesLayout;
