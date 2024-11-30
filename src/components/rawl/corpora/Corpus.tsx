import * as React from "react";
import { AppContext } from "../../AppContext";
import { getSnippetTags } from "../analysis";
import { corpora } from "./corpora";
import { beautifySlug } from "./utils";

interface ComposerInfo {
  slug: string;
  composer: string;
  order?: number;
}

const Corpus: React.FC<{
  slug: string;
  composers?: ComposerInfo[];
}> = ({ slug, composers }) => {
  const { analyses } = React.useContext(AppContext);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const getTagsForMidi = (midiSlug: string) => {
    const analysis = analyses[`f/${midiSlug}`];
    if (analysis) {
      const tags = getSnippetTags(analysis);
      return tags.length > 0 ? tags : null;
    }
    return null;
  };

  const getComposerOrder = (midiSlug: string) => {
    if (!composers) return undefined;
    const composer = composers.find((c) => c.slug === midiSlug);
    return composer?.order;
  };

  const corpus = corpora.filter((corpus) => corpus.slug === slug)?.[0];
  if (!corpus) {
    return <div>Corpus {slug} not found</div>;
  }

  return (
    <div>
      <h1>{beautifySlug(slug)}</h1>
      {corpus.midis.map((midiSlug, index) => {
        const order = getComposerOrder(midiSlug);
        const hasOrder = order !== undefined;

        return (
          <div
            key={midiSlug}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {`${index + 1}. `}
            <a
              href={`/f/${midiSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: hasOrder ? "line-through" : "none",
                color: hasOrder ? "gray" : "#ffaa00",
              }}
            >
              {beautifySlug(midiSlug)}
              {hasOrder && <span style={{ marginLeft: "5px" }}>({order})</span>}
            </a>
            {getTagsForMidi(midiSlug) && (
              <div
                style={{
                  marginLeft: "10px",
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                {getTagsForMidi(midiSlug).map((tag, index) => {
                  const [chapter, topic] = tag.split(":");
                  return (
                    <div
                      key={index}
                      style={{
                        color: hasOrder ? "gray" : "inherit",
                        fontSize: "0.7em",
                        marginRight: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left",
                        lineHeight: "1.2",
                      }}
                    >
                      <span>{chapter?.replace(/_/g, " ")}</span>
                      <span style={{ color: "white" }}>
                        {topic?.replace(/_/g, " ")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Corpus;
