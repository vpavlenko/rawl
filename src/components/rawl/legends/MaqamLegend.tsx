import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import ArrowDown from "../../icons/ArrowDown";
import ArrowUp from "../../icons/ArrowUp";
import Play from "../../icons/Play";
import Square from "../../icons/Square";
import { NotePlaybackContext } from "../notePlayback";
import { MAQAM_REFERENCE_SCALES } from "./maqamScales";
import { MaqamRawlNotation } from "./MaqamRawlNotation";
import { maqamLowerPitches, maqamPlaybackSection, maqamRootJins } from "./maqamPlayback";
import { useMaqamPreview } from "./useMaqamPreview";

const Panel = styled.div`
  position: fixed;
  bottom: 51px;
  right: 36px;
  z-index: 100000;
  max-width: calc(100vw - 48px);
  color: white;
  background: black;
  border: 1px solid #666;
`;
const Fold = styled.button`
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
  jins: maqamRootJins(maqam),
}));
const LOWER_COLUMNS = Math.max(...JINS_ROWS.map(({ maqam }) => maqamLowerPitches(maqam).length));
const COLUMN_COUNT = LOWER_COLUMNS + Math.max(...JINS_ROWS.map(({ jins }) => jins.end + 1));

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
            style={{ color: "#e9b44c", fontSize: 12, padding: "7px 8px" }}
          >
            Theory
          </Link>
        )}
        <Fold
          type="button"
          aria-label={expanded ? "Collapse legend" : "Expand legend"}
          aria-expanded={expanded}
          onClick={() => onExpandedChange(!expanded)}
        >
          {!expanded && "maqamat"}
          {expanded ? <ArrowDown /> : <ArrowUp />}
        </Fold>
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
              return (
                <Row key={maqam.name} data-testid="jins-legend-row">
                  <div>
                    <button
                      type="button"
                      aria-label={`${active ? "Stop" : "Play"} ${jins.name}`}
                      onClick={() => active ? preview.stop() : preview.practiceJins(maqam)}
                    >
                      {jins.name}
                      {active ? <Square /> : <Play />}
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
                    auxiliary={jins.pitches.map((_, index) => index < lowerCount)}
                    activeIndex={preview.active?.name === maqam.name ? preview.active.index : null}
                    onNote={(pitch, index) => preview.play(maqam, [pitch], index)}
                  />
                </Row>
              );
            })}
          </NotePlaybackContext.Provider>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 8px 8px",
              fontSize: 11,
              color: "#aaa",
            }}
          >
            <span>{preview.error ? "Audio unavailable" : "Qanun"}</span>
            {preview.playing && (
              <button type="button" onClick={preview.stop}>
                Stop
              </button>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
};
export default MaqamLegend;
