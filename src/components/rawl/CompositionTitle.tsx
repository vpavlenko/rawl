import {
  faArrowUpRightFromSquare,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { ComposerTitle } from "./book/Book";
import { corpora, MUSESCORE_TOP_100_SLUG } from "./corpora/corpora";
import { CorpusLink } from "./corpora/CorpusLink";
import { TOP_100_COMPOSERS } from "./top100Composers";

export type CompositionTitleProps = {
  slug: string;
  sourceUrl: string | null;
  onSourceUrlUpdate: (newUrl: string) => void;
};

const CompositionTitle: React.FC<CompositionTitleProps> = ({
  slug,
  sourceUrl,
  onSourceUrlUpdate,
}) => {
  const [editedUrl, setEditedUrl] = React.useState(sourceUrl || "");

  const handleSave = () => {
    if (editedUrl !== sourceUrl) {
      onSourceUrlUpdate(editedUrl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  const formattedTitle = slug
    .replace(/---/g, " – ")
    .replace(/-/g, " ")
    .replace(/_/g, " ");

  const relatedCorporaSlugs = React.useMemo(() => {
    return corpora
      .filter((corpus) => corpus.midis.includes(slug))
      .filter((corpus) => corpus.slug !== MUSESCORE_TOP_100_SLUG)
      .map((corpus) => corpus.slug);
  }, [slug]);

  const composerInfo = React.useMemo(() => {
    return TOP_100_COMPOSERS.find((composer) => composer.slug === slug);
  }, [slug]);

  const searchQuery = encodeURIComponent(formattedTitle);
  const museScoreUrl = `https://musescore.com/sheetmusic?sort=view_count&text=${searchQuery}`;

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1em" }}>
        {composerInfo ? (
          <ComposerTitle
            composer={composerInfo.composer}
            displayTitle={composerInfo.displayTitle}
          />
        ) : (
          formattedTitle
        )}
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "gray",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              style={{ width: "15px", marginLeft: "10px" }}
            />
          </a>
        ) : (
          <>
            <input
              type="text"
              value={editedUrl}
              onChange={(e) => setEditedUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              style={{
                marginLeft: "10px",
                fontSize: "0.8em",
                width: "200px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "white",
                padding: "2px 5px",
              }}
              placeholder="Enter source URL"
            />
            <a
              href={museScoreUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "gray",
                textDecoration: "none",
                cursor: "pointer",
                marginLeft: "10px",
              }}
              title="Search on MuseScore"
            >
              <FontAwesomeIcon icon={faLink} />
            </a>
          </>
        )}

        {relatedCorporaSlugs.length > 0 && (
          <span style={{ marginLeft: "20px" }}>
            <span
              style={{ fontWeight: "normal", marginLeft: "10px", gap: "8px" }}
            >
              {relatedCorporaSlugs.map((slug) => (
                <CorpusLink key={slug} slug={slug} />
              ))}
            </span>
          </span>
        )}
      </h1>
    </div>
  );
};

export default CompositionTitle;
