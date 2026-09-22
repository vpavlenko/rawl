import clamp from "lodash/clamp";
import React, { useCallback, useContext, useEffect } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { StyledRangeInput } from "../../Slider";
import { FoldablePianoLegend } from "../legends/PianoLegend";

const TinyLetter = styled.span`
  font-size: 10px;
  color: #fff;
`;

export const debounce = (func, delay) => {
  let timer;
  let frameId;

  return (...args) => {
    clearTimeout(timer);
    cancelAnimationFrame(frameId);

    timer = setTimeout(() => {
      frameId = requestAnimationFrame(() => {
        func.apply(this, args);
      });
    }, delay);
  };
};

type ControlPanelProps = {
  noteHeight: number;
  setNoteHeight: (height: number) => void;
  secondWidth: number;
  setSecondWidth: (width: number) => void;
  slug?: string;
  currentTonic?: number;
  setHoveredColors: (colors: string[] | null) => void;
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  noteHeight,
  setNoteHeight,
  secondWidth,
  setSecondWidth,
  slug,
  currentTonic,
  setHoveredColors,
}) => {
  const { registerKeyboardHandler, unregisterKeyboardHandler } =
    useContext(AppContext);

  const debounceSetNoteHeight = useCallback(debounce(setNoteHeight, 50), []);
  const debounceSetSecondWidth = useCallback(debounce(setSecondWidth, 50), []);

  const handleSecondWidthChange = useCallback(
    (newWidth: number) => {
      setSecondWidth(clamp(newWidth, 2, 150));
    },
    [setSecondWidth],
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "a":
          handleSecondWidthChange(secondWidth - 2);
          break;
        case "d":
          handleSecondWidthChange(secondWidth + 2);
          break;
        case "s":
          debounceSetNoteHeight(Math.min(noteHeight + 0.25, 10));
          break;
        case "w":
          debounceSetNoteHeight(Math.max(noteHeight - 0.25, 1));
          break;
      }
    };

    registerKeyboardHandler("controlPanel", handleKeyPress);

    return () => {
      unregisterKeyboardHandler("controlPanel");
    };
  }, [
    registerKeyboardHandler,
    unregisterKeyboardHandler,
    secondWidth,
    handleSecondWidthChange,
    noteHeight,
    debounceSetNoteHeight,
  ]);

  return (
    <>
      <FoldablePianoLegend
        slug={slug}
        currentTonic={currentTonic}
        setHoveredColors={setHoveredColors}
      />
      <div
        style={{
          position: "fixed",
          bottom: 221,
          right: -131,
          zIndex: 100000,
        }}
      >
        <span style={{ position: "relative", top: -3, left: 12 }}>
          <TinyLetter>w</TinyLetter>
        </span>
        <span
          style={{
            position: "relative",
            top: 169,
            left: 6,
          }}
        >
          <TinyLetter>s</TinyLetter>
        </span>
        <StyledRangeInput
          min="1"
          max="10"
          value={noteHeight}
          onChange={(e) => debounceSetNoteHeight(parseInt(e.target.value, 10))}
          style={{
            transform: "rotate(90deg)",
            transformOrigin: "bottom left",
            width: 160,
          }}
        />
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 35,
          right: 33,
          zIndex: 100000,
        }}
      >
        <span style={{ position: "relative", top: 0, left: 0 }}>
          <TinyLetter>a</TinyLetter>
        </span>
        <StyledRangeInput
          min="2"
          max="150"
          value={secondWidth}
          onChange={(e) => debounceSetSecondWidth(parseInt(e.target.value, 10))}
          style={{
            width: 240,
          }}
        />
        <span style={{ position: "relative", top: 0, left: 0 }}>
          <TinyLetter>d</TinyLetter>
        </span>
      </div>
    </>
  );
};

export default ControlPanel;
