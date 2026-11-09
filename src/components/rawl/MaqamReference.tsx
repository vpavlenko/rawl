import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Play from "../icons/Play";
import Square from "../icons/Square";
import { NotePlaybackContext } from "./notePlayback";
import { corpora } from "./corpora/corpora";
import { formatComposerName } from "./corpusUtils";
import { MAQAM_SCALES, MAQAM_REFERENCE_SCALES } from "./legends/maqamScales";
import {
  maqamLowerPitches,
  maqamPitches,
  maqamPlaybackSection,
  maqamRootJins,
} from "./legends/maqamPlayback";
import { MaqamRawlNotation } from "./legends/MaqamRawlNotation";
import { useMaqamPreview } from "./legends/useMaqamPreview";
import {
  fitMaqamNoteHeight,
  getMaqamNotationLayout,
  MAQAM_ROW_GAP,
  splitMaqamColumns,
} from "./legends/maqamNotationLayout";

const Page = styled.main`
  display: grid;
  height: 100%;
  box-sizing: border-box;
  grid-template-columns: 140px minmax(0, 1fr);
  column-gap: 16px;
  max-width: 1452px;
  margin: 0 auto;
  padding: 8px 16px;
  color: #eee;
  font-family: Tahoma, sans-serif;
  a {
    color: #e9b44c;
  }
  header {
    font-size: 11px;
    line-height: 1.4;
    a,
    span {
      display: block;
      margin-top: 8px;
    }
  }
  h1 {
    font-size: 20px;
    font-weight: normal;
    margin: 0;
  }
  h2 {
    font-size: 14px;
    font-weight: normal;
    margin: 0 0 4px;
  }
  section {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    align-items: center;
    column-gap: 10px;
    flex-shrink: 0;
    scroll-margin-top: 40px;
  }
  figure {
    margin: 0;
    min-width: 0;
  }
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    cursor: pointer;
    background: transparent;
    color: #ccc;
    border: 0;
    padding: 0;
    outline: none;
  }
  button:hover,
  button:focus-visible {
    color: white;
  }
  button:focus-visible {
    outline: 1px solid #e9b44c;
    outline-offset: 2px;
  }
  @media (max-width: 700px) {
    padding: 8px;
    grid-template-columns: 92px minmax(0, 1fr);
    column-gap: 8px;
    section {
      grid-template-columns: 66px minmax(0, 1fr);
      column-gap: 5px;
    }
  }
`;

const Staves = styled.div`
  display: grid;
  column-gap: 24px;
  min-width: 0;
  min-height: 0;
  height: 100%;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${MAQAM_ROW_GAP}px;
  min-width: 0;
  min-height: 0;
`;

const MaqamLabel = styled.div<{ $fifthLineY: number }>`
  position: relative;
  align-self: stretch;
  text-align: right;
  h2 {
    position: absolute;
    right: 0;
    top: ${({ $fifthLineY }) => $fifthLineY}px;
    transform: translateY(-50%);
    line-height: 18px;
    margin: 0;
    white-space: nowrap;
  }
  button {
    position: absolute;
    right: 0;
    top: ${({ $fifthLineY }) => $fifthLineY + 11}px;
    justify-content: flex-end;
  }
`;

const REFERENCE_ROWS = MAQAM_REFERENCE_SCALES.map((maqam) => {
  return {
    maqam,
    pitches: maqamPitches(maqam),
    groups: [...maqam.scaleGroups.map((group) => ({
      ...group,
      start: group.start + maqamLowerPitches(maqam).length,
      // Include the root jins's full core now that its bracket is above.
      // Saba keeps its source span; its extended six-note core overlaps Hijaz.
      end:
        (group.start === 0 ? maqamRootJins(maqam).end : group.end) +
        maqamLowerPitches(maqam).length,
      above: group.start === 0,
    })), ...(maqam.namedShoulders ?? []).map((shoulder) => ({
      label: shoulder.name,
      start: shoulder.start + maqamLowerPitches(maqam).length,
      end: shoulder.end + maqamLowerPitches(maqam).length,
      above: true,
      nameOnly: true,
    }))],
  };
});

const LOWER_COLUMNS = Math.max(
  ...MAQAM_SCALES.map((maqam) => maqamLowerPitches(maqam).length),
);
const COLUMN_COUNT =
  LOWER_COLUMNS + Math.max(...MAQAM_SCALES.map((maqam) => maqam.scale.length));
const ARABIC_CORPORA = corpora.filter((corpus) => corpus.scaleLegend === "maqam");

export default function MaqamReference() {
  const preview = useMaqamPreview();
  const stavesRef = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [columnCount, setColumnCount] = useState(() =>
    window.matchMedia("(min-width: 1280px)").matches ? 2 : 1,
  );
  useLayoutEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const update = () => setColumnCount(media.matches ? 2 : 1);
    media.addEventListener("change", update);
    update();
    return () => media.removeEventListener("change", update);
  }, []);
  useLayoutEffect(() => {
    const element = stavesRef.current;
    if (!element) return;
    const update = () => setAvailableHeight(element.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const noteHeight = useMemo(
    () => fitMaqamNoteHeight(REFERENCE_ROWS, availableHeight, columnCount),
    [availableHeight, columnCount],
  );
  return (
    <Page data-testid="maqam-reference">
      <header>
        <h1>maqam</h1>
        <a
          href="https://www.maqamworld.com/en/book.php"
          target="_blank"
          rel="noreferrer"
        >
          Inside Arabic Music
        </a>
        <span style={{ color: "#999" }}>
          Johnny Farraj · Sami Abu Shumays · 2019
        </span>
        <span style={{ color: "#999" }}>Qanun</span>
        <span>Shift-hover: use this note as tonic.</span>
        <nav aria-label="Arabic corpora">
          {ARABIC_CORPORA.map((corpus) => (
            <Link key={corpus.slug} to={`/corpus/${corpus.slug}`}>
              {corpus.composerName || formatComposerName(corpus.slug)}
            </Link>
          ))}
        </nav>
      </header>
      <Staves
        ref={stavesRef}
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        }}
      >
        <NotePlaybackContext.Provider value={preview.registerNote}>
          {splitMaqamColumns(REFERENCE_ROWS, columnCount).map(
            (rows, column) => (
              <Column key={column} data-testid="maqam-column">
                {rows.map(({ maqam, pitches, groups }) => {
                  const active = preview.playing === maqam.name;
                  const lowerCount = maqamLowerPitches(maqam).length;
                  const { fifthLineY } = getMaqamNotationLayout(
                    pitches,
                    groups,
                    noteHeight,
                  );
                  return (
                    <section key={maqam.name} id={maqam.name.toLowerCase()}>
                      <MaqamLabel $fifthLineY={fifthLineY}>
                        <h2>{maqam.name.toLowerCase()}</h2>
                        <button
                          type="button"
                          aria-label={`${
                            active ? "Stop" : "Play"
                          } ${maqam.name.toLowerCase()}`}
                          onClick={() =>
                            active ? preview.stop() : preview.practice(maqam)
                          }
                        >
                          {active ? <Square /> : <Play />}
                        </button>
                      </MaqamLabel>
                      <figure>
                        <MaqamRawlNotation
                          name={maqam.name}
                          tonic={maqam.tonic}
                          pitches={pitches}
                          startColumn={LOWER_COLUMNS - lowerCount}
                          columnCount={COLUMN_COUNT}
                          minimumColumnWidth={20}
                          noteHeight={noteHeight}
                          section={maqamPlaybackSection(maqam)}
                          auxiliary={pitches.map(
                            (_, index) => index < lowerCount,
                          )}
                          groups={groups}
                          activeIndex={
                            preview.active?.name === maqam.name
                              ? preview.active.index
                              : null
                          }
                          onNote={(pitch, index) =>
                            preview.play(maqam, [pitch], index)
                          }
                        />
                      </figure>
                    </section>
                  );
                })}
              </Column>
            ),
          )}
        </NotePlaybackContext.Provider>
        {preview.error && <div role="status">Audio unavailable</div>}
      </Staves>
    </Page>
  );
}
