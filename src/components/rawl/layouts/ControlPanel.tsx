import { ScoreSizeSliders } from "librawl/components";
import "librawl/score-size-sliders.css";
import React from "react";
import { FoldablePianoLegend } from "../legends/PianoLegend";

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

const sliderTitles = {
  noteHeight: "Note height (W/S, vertical touch pinch, or Shift+trackpad pinch)",
  timeSpacing: "Time spacing (A/D, horizontal touch pinch, or trackpad pinch)",
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
  return (
    <>
      <FoldablePianoLegend
        slug={slug}
        currentTonic={currentTonic}
        setHoveredColors={setHoveredColors}
      />
      <div style={{ "--rawl-size-sliders-z-index": 100001 } as React.CSSProperties}>
        <ScoreSizeSliders
          noteHeight={noteHeight}
          timeSpacing={secondWidth}
          onNoteHeightChange={setNoteHeight}
          onTimeSpacingChange={setSecondWidth}
          keyboardShortcuts
          titles={sliderTitles}
        />
      </div>
    </>
  );
};

export default ControlPanel;
