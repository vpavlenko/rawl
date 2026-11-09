import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import ChevronDown from "../../icons/ChevronDown";
import SquareArrowOutUpRight from "../../icons/SquareArrowOutUpRight";
import Play from "../../icons/Play";
import Square from "../../icons/Square";
import { FoldButton } from "../editor/EditorStyles";
import { NotePlaybackContext } from "../notePlayback";
import { MAQAM_REFERENCE_SCALES } from "./maqamScales";
import { MaqamRawlNotation } from "./MaqamRawlNotation";
import {
  maqamLowerPitches,
  maqamPlaybackSection,
  maqamRootJins,
} from "./maqamPlayback";
import { useMaqamPreview } from "./useMaqamPreview";
import { getMaqamNotationLayout } from "./maqamNotationLayout";

const Panel = styled.div`
  position: fixed;
  bottom: 51px;
  right: 36px;
  z-index: 100000;
  max-width: calc(100vw - 48px);
  color: white;
  background: black;
  border: 1px solid #666;
  padding: 5px;
  box-sizing: border-box;
`;
const Collapsed = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 0;
  background: black;
  color: white;
  cursor: pointer;
`;
const Row = styled.div`
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  padding: 2px 6px;
  gap: 4px;
  cursor: pointer;
  [data-jins-transport] {
    opacity: 0;
  }
  &:hover [data-jins-transport],
  &[data-playing="true"] [data-jins-transport] {
    opacity: 1;
  }
  & > div > button {
    border: 0;
    background: transparent;
    color: white;
    font:
      12px Tahoma,
      sans-serif;
    text-align: right;
    cursor: pointer;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    width: 100%;
    &:hover,
    &:focus-visible {
      color: #e9b44c;
    }
  }
`;

const JINS_ROWS = MAQAM_REFERENCE_SCALES.map((maqam) => ({
  maqam,
  jins: maqamRootJins(maqam, true),
}));
const LOWER_COLUMNS = Math.max(
  ...JINS_ROWS.map(({ maqam }) => maqamLowerPitches(maqam).length),
);
const COLUMN_COUNT =
  LOWER_COLUMNS + Math.max(...JINS_ROWS.map(({ jins }) => jins.end + 1));

const MaqamLegend: React.FC<{
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}> = ({ expanded, onExpandedChange }) => {
  const preview = useMaqamPreview();
  useEffect(() => {
    if (!expanded) preview.stop();
  }, [expanded]);
  return (
    <Panel data-testid="maqam-legend" aria-label="maqamat">
      <FoldButton
        type="button"
        position="top"
        isFolded={!expanded}
        aria-label={expanded ? "Collapse legend" : "Expand legend"}
        aria-expanded={expanded}
        onClick={() => onExpandedChange(!expanded)}
      >
        <span
          style={{
            display: "flex",
            transform: expanded ? undefined : "rotate(180deg)",
          }}
        >
          <ChevronDown />
        </span>
      </FoldButton>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {expanded && (
          <Link
            to="/maqam"
            style={{
              color: "#e9b44c",
              fontSize: 12,
              padding: "7px 8px",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            Maqamat <SquareArrowOutUpRight />
          </Link>
        )}
        {!expanded && (
          <Collapsed type="button" onClick={() => onExpandedChange(true)}>
            maqamat
          </Collapsed>
        )}
      </div>
      {expanded && (
        <div
          style={{
            width: 320,
            maxWidth: "100%",
            maxHeight: "calc(100dvh - 150px)",
            overflowY: "auto",
          }}
        >
          <NotePlaybackContext.Provider value={preview.registerNote}>
            {JINS_ROWS.map(({ maqam, jins }) => {
              const active = preview.playing === maqam.name;
              const lowerCount = maqamLowerPitches(maqam).length;
              const toggle = () =>
                active ? preview.stop() : preview.practiceJins(maqam);
              const layout = getMaqamNotationLayout(jins.pitches, [], 3.5);
              return (
                <Row
                  key={maqam.name}
                  data-testid="jins-legend-row"
                  data-playing={active || undefined}
                  onClick={toggle}
                >
                  <div style={{ position: "relative", alignSelf: "stretch" }}>
                    <button
                      type="button"
                      aria-label={`${active ? "Stop" : "Play"} ${jins.name}`}
                      style={{
                        display: "block",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <svg
                        width="64"
                        height={layout.height}
                        aria-hidden="true"
                        style={{ display: "block" }}
                      >
                        <text
                          x="64"
                          y={layout.tonicLineY}
                          textAnchor="end"
                          dominantBaseline="alphabetic"
                          fill="currentColor"
                        >
                          {jins.name}
                        </text>
                      </svg>
                      <span
                        data-jins-transport
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          right: 0,
                          top: layout.tonicLineY + 4,
                        }}
                      >
                        {active ? <Square /> : <Play />}
                      </span>
                    </button>
                  </div>
                  <MaqamRawlNotation
                    name={jins.name}
                    tonic={maqam.tonic}
                    pitches={jins.pitches}
                    startColumn={LOWER_COLUMNS - lowerCount}
                    columnCount={COLUMN_COUNT}
                    noteHeight={3.5}
                    section={maqamPlaybackSection(maqam)}
                    auxiliary={jins.pitches.map(
                      (_, index) => index < lowerCount,
                    )}
                    activeIndex={
                      preview.active?.name === maqam.name
                        ? preview.active.index
                        : null
                    }
                    onNote={toggle}
                  />
                </Row>
              );
            })}
          </NotePlaybackContext.Provider>
          {preview.error && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "4px 8px 8px",
                fontSize: 11,
                color: "#aaa",
              }}
            >
              Audio unavailable
            </div>
          )}
        </div>
      )}
    </Panel>
  );
};
export default MaqamLegend;
