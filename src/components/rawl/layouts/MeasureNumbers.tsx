import * as React from "react";
import { Link } from "react-router-dom";
import { Analysis, MeasuresSpan, Snippet } from "../analysis";
import { AnalysisGrid, MeasureSelection } from "../AnalysisGrid";
import { SecondsConverter } from "../Rawl";
import { MeasuresAndBeats } from "../SystemLayout";

const InlineSnippets: React.FC<{
  measuresAndBeats: MeasuresAndBeats;
  snippets: Snippet[];
  secondsToX: SecondsConverter;
  sectionSpan?: MeasuresSpan;
}> = ({ measuresAndBeats, snippets, secondsToX, sectionSpan }) => {
  const groupedSnippets = snippets.reduce(
    (acc, snippet) => {
      const measureStart = snippet.measuresSpan[0];
      if (!acc[measureStart]) {
        acc[measureStart] = [];
      }
      acc[measureStart].push(snippet);
      return acc;
    },
    {} as Record<number, Snippet[]>,
  );

  return (
    <>
      {Object.entries(groupedSnippets).map(([measureStart, snippetsGroup]) => {
        const start = parseInt(measureStart);
        if (
          sectionSpan &&
          (start <= sectionSpan[0] || start > sectionSpan[1])
        ) {
          return null;
        }
        const left = secondsToX(measuresAndBeats.measures[start - 1]);

        return (
          <div
            key={start}
            style={{
              position: "absolute",
              top: "-20px",
              left: `${left}px`,
              textAlign: "left",
              color: "#777",
              fontSize: "11px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
            }}
          >
            {snippetsGroup.map((snippet, index) => {
              const [chapter, topic] = snippet.tag.split(":");
              return (
                <Link
                  key={index}
                  to={`/s/${encodeURIComponent(
                    chapter.trim(),
                  )}/${encodeURIComponent(topic.trim())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    marginRight: "10px",
                    lineHeight: "0.9",
                  }}
                >
                  <span style={{ color: "#777" }}>
                    {chapter.replace(/_/g, " ")}
                  </span>
                  <span style={{ color: "#ccc" }}>
                    {topic.replace(/_/g, " ")}
                  </span>
                </Link>
              );
            })}
          </div>
        );
      })}
    </>
  );
};

export const MeasureNumbers: React.FC<{
  measuresAndBeats: MeasuresAndBeats;
  analysis: Analysis;
  phraseStarts: number[];
  measureSelection: MeasureSelection;
  noteHeight: number;
  secondsToX: SecondsConverter;
  sectionSpan?: MeasuresSpan;
}> = ({
  measuresAndBeats,
  analysis,
  phraseStarts,
  measureSelection,
  noteHeight,
  secondsToX,
  sectionSpan,
}) => (
  <div
    key="measure_header"
    style={{
      width:
        secondsToX(
          Math.max(
            measuresAndBeats.measures.at(-1),
            measuresAndBeats.beats.at(-1),
          ),
        ) + 300,
      height: 16,
      marginBottom: "-14px",
      marginLeft: "0px",
      zIndex: 90000,
      position: sectionSpan ? "relative" : "sticky",
      top: 0,
    }}
  >
    <InlineSnippets
      measuresAndBeats={measuresAndBeats}
      snippets={analysis.snippets || []}
      secondsToX={secondsToX}
      sectionSpan={sectionSpan}
    />
    <AnalysisGrid
      analysis={analysis}
      measuresAndBeats={measuresAndBeats}
      midiNumberToY={() => 0}
      noteHeight={noteHeight}
      measureSelection={measureSelection}
      phraseStarts={phraseStarts}
      midiRange={[0, 0]}
      showHeader={true}
      showTonalGrid={false}
      secondsToX={secondsToX}
      sectionSpan={sectionSpan}
    />
  </div>
);
