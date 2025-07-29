import * as React from "react";
import { useContext } from "react";
import { AppContext } from "../../AppContext";
import {
  Analysis,
  MeasuresSpan,
  Snippet,
  filterSnippetsByAccess,
} from "../analysis";
import { AnalysisGrid, MeasureSelection } from "../AnalysisGrid";
import EXPLANATIONS from "../corpora/explanations";
import { MouseHandlers } from "../getNoteRectangles";
import { SecondsConverter } from "../Rawl";
import { SnippetLink } from "../snippets/SnippetLink";
import { MeasuresAndBeats } from "../SystemLayout";

const InlineSnippets: React.FC<{
  measuresAndBeats: MeasuresAndBeats;
  snippets: Snippet[];
  secondsToX: SecondsConverter;
  sectionSpan?: MeasuresSpan;
  analysis: Analysis;
  togglePause?: () => void;
  seek?: (ms: number) => void;
}> = ({
  measuresAndBeats,
  snippets,
  secondsToX,
  sectionSpan,
  analysis,
  togglePause,
  seek,
}) => {
  const appContext = useContext(AppContext);
  const { setHoveredMeasuresSpan } = appContext;
  const [hoveredSnippetIndex, setHoveredSnippetIndex] = React.useState<
    string | null
  >(null);

  const filteredSnippets = React.useMemo(() => {
    return filterSnippetsByAccess(snippets);
  }, [snippets]);

  const [groupedItems, setGroupedItems] = React.useState<
    Record<
      number,
      Array<{
        type: "snippet" | "formSection" | "explanation";
        content: any;
        sourceSnippet?: Snippet;
      }>
    >
  >({});
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    // Group snippets, formSections, and explanations by measure
    const grouped = {} as Record<
      number,
      Array<{
        type: "snippet" | "formSection" | "explanation";
        content: any;
        sourceSnippet?: Snippet;
      }>
    >;

    // Add formSections first
    if (analysis.form) {
      Object.entries(analysis.form).forEach(([measure, section]) => {
        const measureNum = parseInt(measure);
        if (!grouped[measureNum]) {
          grouped[measureNum] = [];
        }
        grouped[measureNum].push({ type: "formSection", content: section });
      });
    }

    // Add snippets and their explanations
    filteredSnippets.forEach((snippet) => {
      const measureStart = snippet.measuresSpan[0];
      if (!grouped[measureStart]) {
        grouped[measureStart] = [];
      }
      grouped[measureStart].push({ type: "snippet", content: snippet });

      // If this snippet is hovered and has an explanation, add it
      if (
        hoveredSnippetIndex === `${measureStart}-${snippet.tag}` &&
        EXPLANATIONS[snippet.tag]
      ) {
        grouped[measureStart].push({
          type: "explanation",
          content: EXPLANATIONS[snippet.tag],
          sourceSnippet: snippet,
        });
      }
    });

    setGroupedItems(grouped);
  }, [filteredSnippets, analysis.form, hoveredSnippetIndex]);

  React.useEffect(() => {
    const checkOverlaps = () => {
      let prevRight = -Infinity;
      let prevIndex = -1;

      itemRefs.current.forEach((ref, index) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          if (rect.left < prevRight) {
            // Overlap detected
            const prevMeasure = parseInt(Object.keys(groupedItems)[prevIndex]);
            const currentMeasure = parseInt(Object.keys(groupedItems)[index]);

            setGroupedItems((prev) => {
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

    const timeoutId = setTimeout(checkOverlaps, 100);
    return () => clearTimeout(timeoutId);
  }, [groupedItems]);

  return (
    <>
      {Object.entries(groupedItems).map(([measureStart, items], groupIndex) => {
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
            ref={(el) => (itemRefs.current[groupIndex] = el)}
            style={{
              position: "absolute",
              top: "-20px",
              left: `${left}px`,
              textAlign: "left",
              color: "#777",
              fontSize: "11px",
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
            }}
          >
            {items.map((item, index) => {
              if (item.type === "formSection") {
                return (
                  <div
                    key={`form_${index}`}
                    style={{
                      color: "#bbb",
                      userSelect: "none",
                      marginRight: "10px",
                      fontSize: "1.2em",
                      position: "relative",
                      top: "5px",
                      cursor: "pointer",
                      transition: "color 0.2s ease",
                    }}
                    onClick={(e) => {
                      if (seek && togglePause) {
                        const seekTime =
                          measuresAndBeats.measures[start - 1] * 1000 - 1000;
                        seek(seekTime);
                        // togglePause();
                        e.stopPropagation();
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#bbb";
                    }}
                  >
                    {item.content}
                  </div>
                );
              } else if (item.type === "explanation") {
                return (
                  <div
                    key={`explanation_${index}`}
                    style={{
                      color: "#fff",
                      marginRight: "10px",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    — {item.content}
                  </div>
                );
              } else {
                const snippet = item.content;
                const [chapter, topic] = snippet.tag.split(":");
                const snippetKey = `${measureStart}-${snippet.tag}`;

                return (
                  <div style={{ marginRight: "10px" }}>
                    <SnippetLink
                      key={`snippet_${index}`}
                      chapter={chapter}
                      topic={topic}
                      onMouseEnter={() => {
                        setHoveredMeasuresSpan(snippet.measuresSpan);
                        setHoveredSnippetIndex(snippetKey);
                      }}
                      onMouseLeave={() => {
                        setHoveredMeasuresSpan(null);
                        setHoveredSnippetIndex(null);
                      }}
                    />
                  </div>
                );
              }
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
  xToSeconds: SecondsConverter;
  sectionSpan?: MeasuresSpan;
  mouseHandlers: MouseHandlers;
  togglePause?: () => void;
  seek?: (ms: number) => void;
}> = ({
  measuresAndBeats,
  analysis,
  phraseStarts,
  measureSelection,
  noteHeight,
  secondsToX,
  xToSeconds,
  sectionSpan,
  mouseHandlers,
  togglePause,
  seek,
}) => {
  const { systemClickHandler } = mouseHandlers;

  return (
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
        marginBottom: "-15px",
        marginLeft: "0px",
        zIndex: 90000,
        position: sectionSpan ? "relative" : "sticky",
        top: 0,
      }}
      onClick={(e) => systemClickHandler(e, xToSeconds)}
    >
      <InlineSnippets
        measuresAndBeats={measuresAndBeats}
        snippets={analysis.snippets || []}
        secondsToX={secondsToX}
        sectionSpan={sectionSpan}
        analysis={analysis}
        togglePause={togglePause}
        seek={seek}
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
};
