import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { SystemLayoutProps } from "./SystemLayout";
import { ColoredNote } from "./parseMidi";

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
`;

const RangeInputs = styled.div`
  display: flex;
  justify-content: space-between;
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

interface FrozenNotesProps {
  notes: ColoredNote[][];
  measureWidth: number;
  midiNumberToY: (midiNumber: number) => number;
}

const FrozenNotes: React.FC<FrozenNotesProps> = ({
  notes,
  measureWidth,
  midiNumberToY,
}) => {
  const getNoteRectangles = (notes: ColoredNote[]) => {
    return notes.map((note) => {
      const {
        span,
        color,
        voiceIndex,
        isActive,
        isDrum,
        note: { midiNumber },
      } = note;
      const top = midiNumberToY(midiNumber);
      const left = span[0] * measureWidth;
      const width = (span[1] - span[0]) * measureWidth;

      return (
        <div
          key={`nr_${note.id}`}
          className={`${color} voiceShape-${voiceIndex}`}
          style={{
            position: "absolute",
            height: `${isActive ? 4 : 0.5}px`,
            width: isDrum ? "0px" : width,
            top: isActive ? top : top + 4 - 0.5,
            left,
            backgroundColor: color,
            zIndex: Math.round(10 + 1000 / width),
          }}
        />
      );
    });
  };

  return (
    <div style={{ position: "relative", height: "600px", width: "100%" }}>
      {notes.map((voiceNotes, index) => (
        <div key={index}>{getNoteRectangles(voiceNotes)}</div>
      ))}
    </div>
  );
};

const FrozenNotesLayout: React.FC<SystemLayoutProps> = ({
  frozenNotes,
  measuresAndBeats,
}) => {
  const [measureRange, setMeasureRange] = useState([1, 4]);
  const [copyIndicatorVisible, setCopyIndicatorVisible] = useState(false);

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

  const filteredNotes = useMemo(
    () =>
      frozenNotes.map((voiceNotes) =>
        voiceNotes.filter((note) => {
          const noteMeasure = measuresAndBeats.measures.findIndex(
            (m) => m > note.span[0],
          );
          return (
            noteMeasure >= measureRange[0] - 1 && noteMeasure < measureRange[1]
          );
        }),
      ),
    [frozenNotes, measureRange, measuresAndBeats],
  );

  const frozenJson = JSON.stringify(filteredNotes, null, 2);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(frozenJson).then(() => {
      setCopyIndicatorVisible(true);
      setTimeout(() => setCopyIndicatorVisible(false), 2000);
    });
  }, [frozenJson]);

  const measureWidth = 100; // Fixed width for each measure
  const midiNumberToY = (midiNumber: number) => (127 - midiNumber) * 4;

  return (
    <Container>
      <FrozenNotesDisplay>
        <h2>
          Frozen Notes (Measures {measureRange[0]}-{measureRange[1]})
        </h2>
        <RangeInputs>
          <div>
            <label>Start Measure:</label>
            <NumberInput
              type="number"
              min="1"
              max={measuresAndBeats.measures.length}
              value={measureRange[0]}
              onChange={handleRangeChange(0)}
            />
          </div>
          <div>
            <label>End Measure:</label>
            <NumberInput
              type="number"
              min="1"
              max={measuresAndBeats.measures.length}
              value={measureRange[1]}
              onChange={handleRangeChange(1)}
            />
          </div>
        </RangeInputs>
        <FrozenNotes
          notes={filteredNotes}
          measureWidth={measureWidth}
          midiNumberToY={midiNumberToY}
        />
      </FrozenNotesDisplay>
      <JsonDisplay onClick={copyToClipboard}>{frozenJson}</JsonDisplay>
      <CopyIndicator visible={copyIndicatorVisible}>
        Copied to clipboard!
      </CopyIndicator>
    </Container>
  );
};

export default FrozenNotesLayout;
