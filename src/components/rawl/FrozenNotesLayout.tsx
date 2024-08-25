import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";
import FrozenNotes from "./FrozenNotes";
import { SystemLayoutProps } from "./SystemLayout";

const Container = styled.div`
  display: flex;
  padding: 20px;
  background-color: black;
  color: white;
`;

const FrozenNotesDisplay = styled.div`
  flex: 1;
  margin-right: 20px;
`;

const JsonDisplay = styled.pre`
  flex: 1;
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

const FrozenNotesLayout: React.FC<SystemLayoutProps> = ({
  frozenNotes,
  measuresAndBeats,
}) => {
  const [measureRange, setMeasureRange] = useState([1, 4]);
  const [copyIndicatorVisible, setCopyIndicatorVisible] = useState(false);
  const endMeasureRef = useRef<HTMLInputElement>(null);

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
    if (endMeasureRef.current) {
      endMeasureRef.current.focus();
    }
  }, []);

  const filteredNotes = React.useMemo(
    () =>
      frozenNotes.map((voiceNotes) =>
        voiceNotes.filter((note) => {
          const noteMeasure = measuresAndBeats.measures.findIndex(
            (m) => m > note.span[0],
          );
          return (
            noteMeasure >= measureRange[0] - 1 && noteMeasure <= measureRange[1]
          );
        }),
      ),
    [frozenNotes, measureRange, measuresAndBeats],
  );

  const frozenJsonOneLiner = JSON.stringify(
    filteredNotes.map((voiceNotes) =>
      voiceNotes.map(({ chipState, ...note }) => note),
    ),
  );

  const exportString = `"${frozenJsonOneLiner.replace(/"/g, '\\"')}"`;

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(exportString).then(() => {
      setCopyIndicatorVisible(true);
      setTimeout(() => setCopyIndicatorVisible(false), 2000);
    });
  }, [exportString]);

  const measureWidth = 100; // Fixed width for each measure
  const midiNumberToY = (midiNumber: number) => (127 - midiNumber) * 4;

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
          />
          <span>to</span>
          <NumberInput
            type="number"
            min="1"
            max={measuresAndBeats.measures.length}
            value={measureRange[1]}
            onChange={handleRangeChange(1)}
            ref={endMeasureRef}
          />
        </RangeInputs>
        <FrozenNotes
          notes={filteredNotes}
          measureWidth={measureWidth}
          midiNumberToY={midiNumberToY}
        />
      </FrozenNotesDisplay>
      <JsonDisplay onClick={copyToClipboard}>{exportString}</JsonDisplay>
      <CopyIndicator visible={copyIndicatorVisible}>
        Copied to clipboard!
      </CopyIndicator>
    </Container>
  );
};

export default FrozenNotesLayout;
