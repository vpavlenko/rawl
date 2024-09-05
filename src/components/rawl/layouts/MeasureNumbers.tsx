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
  const [groupedSnippets, setGroupedSnippets] = React.useState<
    Record<number, Snippet[]>
  >({});
  const snippetRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    const grouped = snippets.reduce(
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
    setGroupedSnippets(grouped);
  }, [snippets]);

  React.useEffect(() => {
    const checkOverlaps = () => {
      let prevRight = -Infinity;
      let prevIndex = -1;

      snippetRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (rect.left < prevRight) {
            // Overlap detected
            const prevMeasure = parseInt(
              Object.keys(groupedSnippets)[prevIndex],
            );
            const currentMeasure = parseInt(
              Object.keys(groupedSnippets)[index],
            );

            setGroupedSnippets((prev) => {
              const updated = { ...prev };
              updated[prevMeasure] = [
                ...updated[prevMeasure],
                ...updated[currentMeasure],
              ];
              delete updated[currentMeasure];
              return updated;
            });
          } else {
            prevRight = rect.right;
            prevIndex = index;
          }
        }
      });
    };

    // Run the check after a short delay to ensure rendering is complete
    const timeoutId = setTimeout(checkOverlaps, 100);
    return () => clearTimeout(timeoutId);
  }, [groupedSnippets]);

  return (
    <>
      {Object.entries(groupedSnippets).map(
        ([measureStart, snippetsGroup], groupIndex) => {
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
              ref={(el) => (snippetRefs.current[groupIndex] = el)}
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
        },
      )}
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
